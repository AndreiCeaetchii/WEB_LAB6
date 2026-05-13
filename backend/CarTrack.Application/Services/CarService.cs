using CarTrack.Application.Dtos;
using CarTrack.Application.Dtos.Cars;
using CarTrack.Application.Exceptions;
using CarTrack.Application.Interfaces;
using CarTrack.Domain.Entities;
using CarTrack.Domain.Interfaces;

namespace CarTrack.Application.Services;

public class CarService(ICarRepository carRepository, IStorageService storageService) : ICarService
{
    private async Task<CarDto> ToDtoAsync(Car car, CancellationToken ct = default)
    {
        var urls = await Task.WhenAll(
            car.CarPictures
                .OrderBy(cp => cp.SortOrder)
                .Select(cp => storageService.GenerateDownloadUrlAsync(cp.Picture.ObjectKey)));
        return new CarDto(
            car.Id, car.Make, car.Model, car.Year, car.Vin, car.LicensePlate,
            car.AccentId, car.IsElectric, car.Favorite,
            urls, car.CreatedAt, car.UpdatedAt);
    }

    public async Task<PaginatedResult<CarDto>> GetCarsAsync(
        Guid userId, int page, int pageSize, CancellationToken ct = default)
    {
        var result = await carRepository.GetUserCarsAsync(userId, page, pageSize, ct);
        var dtos = await Task.WhenAll(result.Items.Select(c => ToDtoAsync(c, ct)));
        return new PaginatedResult<CarDto>(dtos, result.Total, result.Page, result.PageSize);
    }

    public async Task<CarDto> GetCarAsync(Guid carId, Guid userId, CancellationToken ct = default)
    {
        _ = await carRepository.GetCarUserAsync(carId, userId, ct)
            ?? throw new ForbiddenException("Access denied");
        var car = await carRepository.GetCarWithPicturesAsync(carId, ct)
            ?? throw new NotFoundException("Car not found");
        return await ToDtoAsync(car, ct);
    }

    public async Task<CarDto> CreateCarAsync(Guid userId, CarInput input, CancellationToken ct = default)
    {
        var car = new Car
        {
            Id = Guid.NewGuid(),
            Make = input.Make,
            Model = input.Model,
            Year = input.Year,
            Vin = input.Vin,
            LicensePlate = input.LicensePlate,
            AccentId = input.AccentId,
            IsElectric = input.IsElectric,
            Favorite = input.Favorite,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await carRepository.AddCarAsync(car, ct);
        await carRepository.AddCarUserAsync(new CarUser
        {
            CarId = car.Id,
            UserId = userId,
            Role = "owner",
            CreatedAt = DateTime.UtcNow
        }, ct);
        await carRepository.SaveChangesAsync(ct);
        return await ToDtoAsync(car, ct);
    }

    public async Task<CarDto> UpdateCarAsync(
        Guid carId, Guid userId, CarInput input, CancellationToken ct = default)
    {
        var carUser = await carRepository.GetCarUserAsync(carId, userId, ct);
        if (carUser is null || carUser.Role != "owner")
            throw new ForbiddenException("Only the owner can update a car");

        var car = await carRepository.GetCarWithPicturesAsync(carId, ct)
            ?? throw new NotFoundException("Car not found");

        car.Make = input.Make;
        car.Model = input.Model;
        car.Year = input.Year;
        car.Vin = input.Vin;
        car.LicensePlate = input.LicensePlate;
        car.AccentId = input.AccentId;
        car.IsElectric = input.IsElectric;
        car.Favorite = input.Favorite;
        car.UpdatedAt = DateTime.UtcNow;
        await carRepository.SaveChangesAsync(ct);
        return await ToDtoAsync(car, ct);
    }

    public async Task<CarDto> PatchCarAsync(
        Guid carId, Guid userId, CarPatchInput input, CancellationToken ct = default)
    {
        var carUser = await carRepository.GetCarUserAsync(carId, userId, ct);
        if (carUser is null || carUser.Role != "owner")
            throw new ForbiddenException("Only the owner can patch a car");

        var car = await carRepository.GetCarWithPicturesAsync(carId, ct)
            ?? throw new NotFoundException("Car not found");

        if (input.Make is not null) car.Make = input.Make;
        if (input.Model is not null) car.Model = input.Model;
        if (input.Year.HasValue) car.Year = input.Year.Value;
        if (input.Vin is not null) car.Vin = input.Vin;
        if (input.LicensePlate is not null) car.LicensePlate = input.LicensePlate;
        if (input.AccentId is not null) car.AccentId = input.AccentId;
        if (input.IsElectric.HasValue) car.IsElectric = input.IsElectric.Value;
        if (input.Favorite.HasValue) car.Favorite = input.Favorite.Value;

        if (input.PictureId.HasValue)
        {
            var picture = await carRepository.GetPictureAsync(input.PictureId.Value, ct)
                ?? throw new NotFoundException("Picture not found");
            var count = await carRepository.CountCarPicturesAsync(carId, ct);
            await carRepository.AddCarPictureAsync(new CarPicture
            {
                CarId = carId,
                PictureId = picture.Id,
                SortOrder = count
            }, ct);
        }

        car.UpdatedAt = DateTime.UtcNow;
        await carRepository.SaveChangesAsync(ct);

        // Reload to include any newly-linked picture
        car = (await carRepository.GetCarWithPicturesAsync(carId, ct))!;
        return await ToDtoAsync(car, ct);
    }

    public async Task DeleteCarAsync(Guid carId, Guid userId, CancellationToken ct = default)
    {
        var carUser = await carRepository.GetCarUserAsync(carId, userId, ct);
        if (carUser is null || carUser.Role != "owner")
            throw new ForbiddenException("Only the owner can delete a car");

        var car = await carRepository.GetCarWithPicturesAsync(carId, ct)
            ?? throw new NotFoundException("Car not found");

        foreach (var cp in car.CarPictures)
            await storageService.DeleteObjectAsync(cp.Picture.ObjectKey);

        await carRepository.RemoveCarAsync(car);
        await carRepository.SaveChangesAsync(ct);
    }

    public async Task<UploadUrlResponse> GetUploadUrlAsync(
        Guid carId, Guid userId, CancellationToken ct = default)
    {
        var carUser = await carRepository.GetCarUserAsync(carId, userId, ct);
        if (carUser is null || carUser.Role != "owner")
            throw new ForbiddenException("Only the owner can upload photos");

        _ = await carRepository.GetCarWithPicturesAsync(carId, ct)
            ?? throw new NotFoundException("Car not found");

        var pictureId = Guid.NewGuid();
        var objectKey = storageService.BuildObjectKey("cars", userId, carId, $"{pictureId}.webp");

        await carRepository.AddPictureAsync(new Picture
        {
            Id = pictureId,
            ObjectKey = objectKey,
            MimeType = "image/webp",
            CreatedAt = DateTime.UtcNow
        }, ct);
        await carRepository.SaveChangesAsync(ct);

        var uploadUrl = await storageService.GenerateUploadUrlAsync(objectKey);
        return new UploadUrlResponse(uploadUrl, objectKey, pictureId);
    }

    public async Task RemovePhotoAsync(
        Guid carId, Guid userId, Guid pictureId, CancellationToken ct = default)
    {
        var carUser = await carRepository.GetCarUserAsync(carId, userId, ct);
        if (carUser is null || carUser.Role != "owner")
            throw new ForbiddenException("Only the owner can remove photos");

        var carPicture = await carRepository.GetCarPictureAsync(carId, pictureId, ct)
            ?? throw new NotFoundException("Photo not found");

        await storageService.DeleteObjectAsync(carPicture.Picture.ObjectKey);
        await carRepository.RemoveCarPictureAsync(carPicture);
        await carRepository.RemovePictureAsync(carPicture.Picture);
        await carRepository.SaveChangesAsync(ct);
    }
}

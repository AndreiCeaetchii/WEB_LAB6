using CarTrack.Application.Dtos;
using CarTrack.Application.Interfaces;
using CarTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CarTrack.Infrastructure.Persistence.Repositories;

public class CarRepository(AppDbContext context) : ICarRepository
{
    public async Task<PaginatedResult<Car>> GetUserCarsAsync(
        Guid userId, int page, int pageSize, CancellationToken ct = default)
    {
        var carIds = await context.CarUsers
            .Where(cu => cu.UserId == userId)
            .Select(cu => cu.CarId)
            .ToListAsync(ct);

        var total = carIds.Count;
        var pagedIds = carIds
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var items = await context.Cars
            .Where(c => pagedIds.Contains(c.Id))
            .Include(c => c.CarPictures)
                .ThenInclude(cp => cp.Picture)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(ct);

        return new PaginatedResult<Car>(items, total, page, pageSize);
    }

    public Task<Car?> GetCarWithPicturesAsync(Guid carId, CancellationToken ct = default)
        => context.Cars
            .Include(c => c.CarPictures)
                .ThenInclude(cp => cp.Picture)
            .FirstOrDefaultAsync(c => c.Id == carId, ct);

    public Task<CarUser?> GetCarUserAsync(Guid carId, Guid userId, CancellationToken ct = default)
        => context.CarUsers
            .FirstOrDefaultAsync(cu => cu.CarId == carId && cu.UserId == userId, ct);

    public Task AddCarAsync(Car car, CancellationToken ct = default)
    {
        context.Cars.Add(car);
        return Task.CompletedTask;
    }

    public Task AddCarUserAsync(CarUser carUser, CancellationToken ct = default)
    {
        context.CarUsers.Add(carUser);
        return Task.CompletedTask;
    }

    public Task RemoveCarAsync(Car car)
    {
        context.Cars.Remove(car);
        return Task.CompletedTask;
    }

    public Task AddPictureAsync(Picture picture, CancellationToken ct = default)
    {
        context.Pictures.Add(picture);
        return Task.CompletedTask;
    }

    public Task AddCarPictureAsync(CarPicture carPicture, CancellationToken ct = default)
    {
        context.CarPictures.Add(carPicture);
        return Task.CompletedTask;
    }

    public Task<Picture?> GetPictureAsync(Guid pictureId, CancellationToken ct = default)
        => context.Pictures.FindAsync([pictureId], ct).AsTask();

    public Task<CarPicture?> GetCarPictureAsync(Guid carId, Guid pictureId, CancellationToken ct = default)
        => context.CarPictures
            .Include(cp => cp.Picture)
            .FirstOrDefaultAsync(cp => cp.CarId == carId && cp.PictureId == pictureId, ct);

    public Task RemovePictureAsync(Picture picture)
    {
        context.Pictures.Remove(picture);
        return Task.CompletedTask;
    }

    public Task RemoveCarPictureAsync(CarPicture carPicture)
    {
        context.CarPictures.Remove(carPicture);
        return Task.CompletedTask;
    }

    public Task<int> CountCarPicturesAsync(Guid carId, CancellationToken ct = default)
        => context.CarPictures.CountAsync(cp => cp.CarId == carId, ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => context.SaveChangesAsync(ct);
}

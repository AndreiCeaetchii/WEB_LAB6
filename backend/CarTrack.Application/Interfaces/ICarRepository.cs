using CarTrack.Application.Dtos;
using CarTrack.Domain.Entities;

namespace CarTrack.Application.Interfaces;

public interface ICarRepository
{
    Task<PaginatedResult<Car>> GetUserCarsAsync(Guid userId, int page, int pageSize, CancellationToken ct = default);
    Task<Car?> GetCarWithPicturesAsync(Guid carId, CancellationToken ct = default);
    Task<CarUser?> GetCarUserAsync(Guid carId, Guid userId, CancellationToken ct = default);
    Task AddCarAsync(Car car, CancellationToken ct = default);
    Task AddCarUserAsync(CarUser carUser, CancellationToken ct = default);
    Task RemoveCarAsync(Car car);
    Task AddPictureAsync(Picture picture, CancellationToken ct = default);
    Task AddCarPictureAsync(CarPicture carPicture, CancellationToken ct = default);
    Task<Picture?> GetPictureAsync(Guid pictureId, CancellationToken ct = default);
    Task<CarPicture?> GetCarPictureAsync(Guid carId, Guid pictureId, CancellationToken ct = default);
    Task RemovePictureAsync(Picture picture);
    Task RemoveCarPictureAsync(CarPicture carPicture);
    Task<int> CountCarPicturesAsync(Guid carId, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}

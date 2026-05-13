using CarTrack.Application.Dtos;
using CarTrack.Application.Dtos.Cars;

namespace CarTrack.Application.Interfaces;

public interface ICarService
{
    Task<PaginatedResult<CarDto>> GetCarsAsync(Guid userId, int page, int pageSize, CancellationToken ct = default);
    Task<CarDto> GetCarAsync(Guid carId, Guid userId, CancellationToken ct = default);
    Task<CarDto> CreateCarAsync(Guid userId, CarInput input, CancellationToken ct = default);
    Task<CarDto> UpdateCarAsync(Guid carId, Guid userId, CarInput input, CancellationToken ct = default);
    Task<CarDto> PatchCarAsync(Guid carId, Guid userId, CarPatchInput input, CancellationToken ct = default);
    Task DeleteCarAsync(Guid carId, Guid userId, CancellationToken ct = default);
    Task<UploadUrlResponse> GetUploadUrlAsync(Guid carId, Guid userId, CancellationToken ct = default);
    Task RemovePhotoAsync(Guid carId, Guid userId, Guid pictureId, CancellationToken ct = default);
}

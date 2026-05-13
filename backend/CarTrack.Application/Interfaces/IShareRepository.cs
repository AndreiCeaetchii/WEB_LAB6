using CarTrack.Application.Dtos.Shares;
using CarTrack.Domain.Entities;

namespace CarTrack.Application.Interfaces;

public interface IShareRepository
{
    Task<CarShare?> GetByTokenAsync(string token, CancellationToken ct = default);
    Task<CarSharePreview?> GetPreviewAsync(string token, CancellationToken ct = default);
    Task<List<CarShare>> GetActiveByCarIdAsync(Guid carId, CancellationToken ct = default);
    Task AddAsync(CarShare share, CancellationToken ct = default);
    Task RemoveAsync(CarShare share, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}

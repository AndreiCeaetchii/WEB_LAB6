using CarTrack.Application.Dtos.Shares;

namespace CarTrack.Application.Interfaces;

public interface IShareService
{
    Task<ShareTokenResponse> CreateShareAsync(Guid carId, Guid userId, CancellationToken ct = default);
    Task<CarPreviewResponse> GetPreviewAsync(string token, CancellationToken ct = default);
    Task<Guid> RedeemAsync(string token, Guid userId, CancellationToken ct = default);
    Task<List<ShareInfoDto>> ListSharesAsync(Guid carId, Guid userId, CancellationToken ct = default);
    Task RevokeAsync(string token, Guid userId, CancellationToken ct = default);
}

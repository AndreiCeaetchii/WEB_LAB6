using CarTrack.Domain.Entities;

namespace CarTrack.Application.Interfaces;

public interface IAuthRepository
{
    Task<User?> FindUserByEmailAsync(string email, CancellationToken ct = default);
    Task AddUserAsync(User user, CancellationToken ct = default);
    Task AddRefreshTokenAsync(RefreshToken token, CancellationToken ct = default);
    Task<RefreshToken?> FindRefreshTokenByHashAsync(string hash, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}

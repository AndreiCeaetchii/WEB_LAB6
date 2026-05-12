using CarTrack.Application.Dtos.Auth;

namespace CarTrack.Application.Interfaces;

public interface IAuthService
{
    Task<TokenResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<TokenResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<TokenResponse> RefreshAsync(string rawRefreshToken, CancellationToken ct = default);
    Task LogoutAsync(string rawRefreshToken, CancellationToken ct = default);
}

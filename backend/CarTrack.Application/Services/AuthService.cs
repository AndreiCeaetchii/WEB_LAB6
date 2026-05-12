using CarTrack.Application.Dtos.Auth;
using CarTrack.Application.Exceptions;
using CarTrack.Application.Interfaces;
using CarTrack.Domain.Entities;
using CarTrack.Domain.Interfaces;

namespace CarTrack.Application.Services;

public class AuthService(IAuthRepository repo, ITokenService tokenService) : IAuthService
{
    public async Task<TokenResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (await repo.FindUserByEmailAsync(request.Email, ct) is not null)
            throw new ConflictException("Email already in use");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "user",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await repo.AddUserAsync(user, ct);

        var rawToken = tokenService.GenerateRefreshToken();
        await repo.AddRefreshTokenAsync(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = tokenService.HashToken(rawToken),
            ExpiresAt = DateTime.UtcNow.AddDays(tokenService.RefreshTokenDays),
            CreatedAt = DateTime.UtcNow
        }, ct);
        await repo.SaveChangesAsync(ct);

        return new TokenResponse(
            tokenService.GenerateAccessToken(user.Id, user.Email, user.Role),
            rawToken,
            new UserDto(user.Id, user.Email, user.Role));
    }

    public async Task<TokenResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await repo.FindUserByEmailAsync(request.Email, ct)
            ?? throw new UnauthorizedException("Invalid credentials");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid credentials");

        var rawToken = tokenService.GenerateRefreshToken();
        await repo.AddRefreshTokenAsync(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = tokenService.HashToken(rawToken),
            ExpiresAt = DateTime.UtcNow.AddDays(tokenService.RefreshTokenDays),
            CreatedAt = DateTime.UtcNow
        }, ct);
        await repo.SaveChangesAsync(ct);

        return new TokenResponse(
            tokenService.GenerateAccessToken(user.Id, user.Email, user.Role),
            rawToken,
            new UserDto(user.Id, user.Email, user.Role));
    }

    public async Task<TokenResponse> RefreshAsync(string rawRefreshToken, CancellationToken ct = default)
    {
        var hash = tokenService.HashToken(rawRefreshToken);
        var stored = await repo.FindRefreshTokenByHashAsync(hash, ct)
            ?? throw new UnauthorizedException("Invalid refresh token");

        if (stored.RevokedAt.HasValue || stored.ExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedException("Refresh token expired or revoked");

        stored.RevokedAt = DateTime.UtcNow;

        var rawToken = tokenService.GenerateRefreshToken();
        await repo.AddRefreshTokenAsync(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = stored.UserId,
            TokenHash = tokenService.HashToken(rawToken),
            ExpiresAt = DateTime.UtcNow.AddDays(tokenService.RefreshTokenDays),
            CreatedAt = DateTime.UtcNow
        }, ct);
        await repo.SaveChangesAsync(ct);

        var user = stored.User;
        return new TokenResponse(
            tokenService.GenerateAccessToken(user.Id, user.Email, user.Role),
            rawToken,
            new UserDto(user.Id, user.Email, user.Role));
    }

    public async Task LogoutAsync(string rawRefreshToken, CancellationToken ct = default)
    {
        var hash = tokenService.HashToken(rawRefreshToken);
        var stored = await repo.FindRefreshTokenByHashAsync(hash, ct);
        if (stored is { RevokedAt: null })
        {
            stored.RevokedAt = DateTime.UtcNow;
            await repo.SaveChangesAsync(ct);
        }
    }
}

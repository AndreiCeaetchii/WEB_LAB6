using CarTrack.Application.Interfaces;
using CarTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CarTrack.Infrastructure.Persistence.Repositories;

public class AuthRepository(AppDbContext db) : IAuthRepository
{
    public Task<User?> FindUserByEmailAsync(string email, CancellationToken ct = default)
        => db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

    public async Task AddUserAsync(User user, CancellationToken ct = default)
        => await db.Users.AddAsync(user, ct);

    public async Task AddRefreshTokenAsync(RefreshToken token, CancellationToken ct = default)
        => await db.RefreshTokens.AddAsync(token, ct);

    public Task<RefreshToken?> FindRefreshTokenByHashAsync(string hash, CancellationToken ct = default)
        => db.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == hash, ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => db.SaveChangesAsync(ct);
}

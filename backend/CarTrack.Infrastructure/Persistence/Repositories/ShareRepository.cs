using CarTrack.Application.Dtos.Shares;
using CarTrack.Application.Interfaces;
using CarTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CarTrack.Infrastructure.Persistence.Repositories;

public class ShareRepository(AppDbContext context) : IShareRepository
{
    public Task<CarShare?> GetByTokenAsync(string token, CancellationToken ct = default)
        => context.CarShares.FirstOrDefaultAsync(s => s.Token == token, ct);

    public async Task<CarSharePreview?> GetPreviewAsync(string token, CancellationToken ct = default)
    {
        var result = await context.CarShares
            .Where(s => s.Token == token)
            .Join(context.Cars,
                s => s.CarId,
                c => c.Id,
                (s, c) => new { Share = s, Car = c })
            .Select(x => new
            {
                x.Share.CarId,
                x.Car.Make,
                x.Car.Model,
                x.Car.Year,
                x.Share.ExpiresAt,
                x.Share.RedeemedAt
            })
            .FirstOrDefaultAsync(ct);

        if (result == null) return null;

        var ownerEmail = await context.CarUsers
            .Where(cu => cu.CarId == result.CarId && cu.Role == "owner")
            .Join(context.Users, cu => cu.UserId, u => u.Id, (cu, u) => u.Email)
            .FirstOrDefaultAsync(ct) ?? string.Empty;

        return new CarSharePreview(
            result.CarId,
            result.Make,
            result.Model,
            result.Year,
            ownerEmail,
            result.ExpiresAt,
            result.RedeemedAt);
    }

    public Task<List<CarShare>> GetActiveByCarIdAsync(Guid carId, CancellationToken ct = default)
        => context.CarShares
            .Where(s => s.CarId == carId
                     && s.ExpiresAt > DateTime.UtcNow
                     && s.RedeemedAt == null)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(ct);

    public Task AddAsync(CarShare share, CancellationToken ct = default)
    {
        context.CarShares.Add(share);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(CarShare share, CancellationToken ct = default)
    {
        context.CarShares.Remove(share);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct = default)
        => context.SaveChangesAsync(ct);
}

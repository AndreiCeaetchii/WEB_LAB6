using System.Security.Cryptography;
using CarTrack.Application.Dtos.Shares;
using CarTrack.Application.Exceptions;
using CarTrack.Application.Interfaces;
using CarTrack.Domain.Entities;
using QRCoder;

namespace CarTrack.Application.Services;

public class ShareService(
    IShareRepository shareRepository,
    ICarRepository carRepository,
    string frontendBaseUrl) : IShareService
{
    public async Task<ShareTokenResponse> CreateShareAsync(
        Guid carId, Guid userId, CancellationToken ct = default)
    {
        var carUser = await carRepository.GetCarUserAsync(carId, userId, ct);
        if (carUser is null || carUser.Role != "owner")
            throw new ForbiddenException("Only the car owner can generate share links");

        var tokenBytes = RandomNumberGenerator.GetBytes(32);
        var token = Convert.ToBase64String(tokenBytes)
            .Replace("+", "-").Replace("/", "_").TrimEnd('=');

        var share = new CarShare
        {
            Id = Guid.NewGuid(),
            CarId = carId,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            CreatedAt = DateTime.UtcNow
        };
        await shareRepository.AddAsync(share, ct);
        await shareRepository.SaveChangesAsync(ct);

        var url = $"{frontendBaseUrl}/#/share/{token}";
        var qrPngBase64 = GenerateQrPngBase64(url);

        return new ShareTokenResponse(token, url, qrPngBase64, share.ExpiresAt);
    }

    public async Task<CarPreviewResponse> GetPreviewAsync(
        string token, CancellationToken ct = default)
    {
        var preview = await shareRepository.GetPreviewAsync(token, ct)
            ?? throw new NotFoundException("Share token not found");

        if (preview.ExpiresAt < DateTime.UtcNow)
            throw new NotFoundException("Share token has expired");

        return new CarPreviewResponse(
            preview.CarId,
            preview.Make,
            preview.Model,
            preview.Year,
            preview.OwnerEmail,
            preview.ExpiresAt);
    }

    public async Task<Guid> RedeemAsync(
        string token, Guid userId, CancellationToken ct = default)
    {
        var share = await shareRepository.GetByTokenAsync(token, ct)
            ?? throw new NotFoundException("Share token not found or expired");

        if (share.ExpiresAt < DateTime.UtcNow)
            throw new NotFoundException("Share token not found or expired");

        // Idempotent: if already a member, succeed without re-marking redeemed
        var existing = await carRepository.GetCarUserAsync(share.CarId, userId, ct);
        if (existing is not null)
            return share.CarId;

        if (share.RedeemedAt.HasValue)
            throw new ConflictException("Share token has already been redeemed");

        share.RedeemedAt = DateTime.UtcNow;
        share.RedeemedBy = userId;

        await carRepository.AddCarUserAsync(new CarUser
        {
            CarId = share.CarId,
            UserId = userId,
            Role = "collaborator",
            CreatedAt = DateTime.UtcNow
        }, ct);

        await shareRepository.SaveChangesAsync(ct);
        return share.CarId;
    }

    public async Task<List<ShareInfoDto>> ListSharesAsync(
        Guid carId, Guid userId, CancellationToken ct = default)
    {
        var carUser = await carRepository.GetCarUserAsync(carId, userId, ct);
        if (carUser is null || carUser.Role != "owner")
            throw new ForbiddenException("Only the car owner can list shares");

        var shares = await shareRepository.GetActiveByCarIdAsync(carId, ct);
        return shares.Select(s => new ShareInfoDto(
            s.Token,
            $"{frontendBaseUrl}/#/share/{s.Token}",
            s.ExpiresAt,
            s.RedeemedAt)).ToList();
    }

    public async Task RevokeAsync(string token, Guid userId, CancellationToken ct = default)
    {
        var share = await shareRepository.GetByTokenAsync(token, ct)
            ?? throw new NotFoundException("Share token not found");

        var carUser = await carRepository.GetCarUserAsync(share.CarId, userId, ct);
        if (carUser is null || carUser.Role != "owner")
            throw new ForbiddenException("Only the car owner can revoke shares");

        await shareRepository.RemoveAsync(share, ct);
        await shareRepository.SaveChangesAsync(ct);
    }

    private static string GenerateQrPngBase64(string url)
    {
        using var qrGenerator = new QRCodeGenerator();
        var qrCodeData = qrGenerator.CreateQrCode(url, QRCodeGenerator.ECCLevel.Q);
        var qrCode = new PngByteQRCode(qrCodeData);
        var pngBytes = qrCode.GetGraphic(10);
        return Convert.ToBase64String(pngBytes);
    }
}

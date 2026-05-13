namespace CarTrack.Application.Dtos.Shares;

public record CarSharePreview(
    Guid CarId,
    string Make,
    string Model,
    int Year,
    string OwnerEmail,
    DateTime ExpiresAt,
    DateTime? RedeemedAt);

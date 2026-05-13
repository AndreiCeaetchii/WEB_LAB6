namespace CarTrack.Application.Dtos.Shares;

public record CarPreviewResponse(
    Guid CarId,
    string Make,
    string Model,
    int Year,
    string OwnerEmail,
    DateTime ExpiresAt);

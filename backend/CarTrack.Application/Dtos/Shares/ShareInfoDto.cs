namespace CarTrack.Application.Dtos.Shares;

public record ShareInfoDto(
    string Token,
    string Url,
    DateTime ExpiresAt,
    DateTime? RedeemedAt);

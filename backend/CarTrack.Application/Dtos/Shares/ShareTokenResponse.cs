namespace CarTrack.Application.Dtos.Shares;

public record ShareTokenResponse(
    string Token,
    string Url,
    string QrPngBase64,
    DateTime ExpiresAt);

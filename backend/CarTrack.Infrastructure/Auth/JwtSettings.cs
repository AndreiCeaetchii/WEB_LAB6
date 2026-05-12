namespace CarTrack.Infrastructure.Auth;

public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = "cartrack-api";
    public string Audience { get; set; } = "cartrack-app";
    public int AccessTokenMinutes { get; set; } = 1;
    public int RefreshTokenDays { get; set; } = 7;
}

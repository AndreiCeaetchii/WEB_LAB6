namespace CarTrack.Domain.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(Guid userId, string email, string role);
    string GenerateRefreshToken();
    string HashToken(string token);
    (Guid userId, string email, string role) ValidateAccessToken(string token);
}

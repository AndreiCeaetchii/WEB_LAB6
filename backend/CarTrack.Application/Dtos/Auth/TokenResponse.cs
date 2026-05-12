namespace CarTrack.Application.Dtos.Auth;

public record TokenResponse(string AccessToken, string RefreshToken, UserDto User);

using System.ComponentModel.DataAnnotations;

namespace CarTrack.Application.Dtos.Auth;

public record LogoutRequest([Required] string RefreshToken);

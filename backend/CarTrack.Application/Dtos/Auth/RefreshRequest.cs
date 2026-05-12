using System.ComponentModel.DataAnnotations;

namespace CarTrack.Application.Dtos.Auth;

public record RefreshRequest([Required] string RefreshToken);

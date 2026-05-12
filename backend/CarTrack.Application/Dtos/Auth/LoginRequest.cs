using System.ComponentModel.DataAnnotations;

namespace CarTrack.Application.Dtos.Auth;

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

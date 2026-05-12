using System.ComponentModel.DataAnnotations;

namespace CarTrack.Application.Dtos.Auth;

public record RegisterRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password
);

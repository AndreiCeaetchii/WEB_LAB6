using CarTrack.Application.Dtos.Auth;
using CarTrack.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarTrack.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<TokenResponse>> Register(
        [FromBody] RegisterRequest request, CancellationToken ct)
        => Ok(await authService.RegisterAsync(request, ct));

    [HttpPost("login")]
    public async Task<ActionResult<TokenResponse>> Login(
        [FromBody] LoginRequest request, CancellationToken ct)
        => Ok(await authService.LoginAsync(request, ct));

    [HttpPost("refresh")]
    public async Task<ActionResult<TokenResponse>> Refresh(
        [FromBody] RefreshRequest request, CancellationToken ct)
        => Ok(await authService.RefreshAsync(request.RefreshToken, ct));

    [HttpDelete("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(
        [FromQuery] string refreshToken, CancellationToken ct)
    {
        await authService.LogoutAsync(refreshToken, ct);
        return NoContent();
    }
}

using CarTrack.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CarTrack.API.Controllers;

[ApiController]
public class TokenController(ITokenService tokenService, IWebHostEnvironment env) : ControllerBase
{
    [HttpPost("/token")]
    [HttpGet("/token")]
    public IActionResult GetToken([FromBody] TokenRoleBody? body, [FromQuery] string? role)
    {
        if (env.IsProduction())
            return NotFound();

        var r = body?.Role ?? role ?? "user";
        if (r != "admin" && r != "user")
            return BadRequest(new { error = "role must be 'admin' or 'user'" });

        var accessToken = tokenService.GenerateAccessToken(Guid.Empty, "demo@lab.local", r);
        return Ok(new { accessToken });
    }
}

public record TokenRoleBody(string? Role);

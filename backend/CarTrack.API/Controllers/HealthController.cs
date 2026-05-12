using Microsoft.AspNetCore.Mvc;

namespace CarTrack.API.Controllers;

[ApiController]
public class HealthController : ControllerBase
{
    [HttpGet("/api/health")]
    public IActionResult Health() =>
        Ok(new { status = "ok", timestamp = DateTime.UtcNow });
}

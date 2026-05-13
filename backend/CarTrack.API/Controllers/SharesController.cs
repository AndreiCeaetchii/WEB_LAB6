using System.Security.Claims;
using CarTrack.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarTrack.API.Controllers;

[ApiController]
[Authorize]
public class SharesController(IShareService shareService) : ControllerBase
{
    private Guid GetUserId()
    {
        var sub = User.FindFirstValue("sub")
               ?? User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        return Guid.Parse(sub);
    }

    [HttpPost("api/cars/{carId:guid}/shares")]
    public async Task<IActionResult> CreateShare(Guid carId, CancellationToken ct)
        => Ok(await shareService.CreateShareAsync(carId, GetUserId(), ct));

    [AllowAnonymous]
    [HttpGet("api/shares/{token}")]
    public async Task<IActionResult> GetPreview(string token, CancellationToken ct)
        => Ok(await shareService.GetPreviewAsync(token, ct));

    [HttpPost("api/shares/{token}/redeem")]
    public async Task<IActionResult> Redeem(string token, CancellationToken ct)
    {
        var carId = await shareService.RedeemAsync(token, GetUserId(), ct);
        return Ok(new { carId });
    }

    [HttpGet("api/cars/{carId:guid}/shares")]
    public async Task<IActionResult> ListShares(Guid carId, CancellationToken ct)
        => Ok(await shareService.ListSharesAsync(carId, GetUserId(), ct));

    [HttpDelete("api/shares/{token}")]
    public async Task<IActionResult> RevokeShare(string token, CancellationToken ct)
    {
        await shareService.RevokeAsync(token, GetUserId(), ct);
        return NoContent();
    }
}

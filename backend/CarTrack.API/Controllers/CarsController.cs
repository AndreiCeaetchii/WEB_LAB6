using System.Security.Claims;
using CarTrack.Application.Dtos.Cars;
using CarTrack.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarTrack.API.Controllers;

[ApiController]
[Route("api/cars")]
[Authorize]
public class CarsController(ICarService carService) : ControllerBase
{
    private Guid GetUserId()
    {
        var sub = User.FindFirstValue("sub")
               ?? User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        return Guid.Parse(sub);
    }

    [HttpGet]
    public async Task<IActionResult> ListCars(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        => Ok(await carService.GetCarsAsync(GetUserId(), page, pageSize, ct));

    [HttpPost]
    public async Task<IActionResult> CreateCar([FromBody] CarInput input, CancellationToken ct)
    {
        var dto = await carService.CreateCarAsync(GetUserId(), input, ct);
        return CreatedAtAction(nameof(GetCar), new { id = dto.Id }, dto);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCar(Guid id, CancellationToken ct)
        => Ok(await carService.GetCarAsync(id, GetUserId(), ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCar(
        Guid id, [FromBody] CarInput input, CancellationToken ct)
        => Ok(await carService.UpdateCarAsync(id, GetUserId(), input, ct));

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> PatchCar(
        Guid id, [FromBody] CarPatchInput input, CancellationToken ct)
        => Ok(await carService.PatchCarAsync(id, GetUserId(), input, ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCar(Guid id, CancellationToken ct)
    {
        await carService.DeleteCarAsync(id, GetUserId(), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/photos/upload-url")]
    public async Task<IActionResult> GetUploadUrl(Guid id, CancellationToken ct)
        => Ok(await carService.GetUploadUrlAsync(id, GetUserId(), ct));

    [HttpDelete("{id:guid}/photos/{pictureId:guid}")]
    public async Task<IActionResult> DeletePhoto(Guid id, Guid pictureId, CancellationToken ct)
    {
        await carService.RemovePhotoAsync(id, GetUserId(), pictureId, ct);
        return NoContent();
    }
}

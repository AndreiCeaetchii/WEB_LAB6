using System.Security.Claims;
using CarTrack.Application.Dtos.Documents;
using CarTrack.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarTrack.API.Controllers;

[ApiController]
[Route("api/cars/{carId:guid}/documents")]
[Authorize]
public class DocumentsController(IDocumentService documentService) : ControllerBase
{
    private Guid GetUserId()
    {
        var sub = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        return Guid.Parse(sub);
    }

    [HttpGet]
    public async Task<IActionResult> List(
        Guid carId,
        [FromQuery] string? kind,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await documentService.GetDocumentsAsync(carId, GetUserId(), kind, page, pageSize, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid carId, DocumentInput input, CancellationToken ct = default)
    {
        var dto = await documentService.CreateDocumentAsync(carId, GetUserId(), input, ct);
        return CreatedAtAction(nameof(GetOne), new { carId, id = dto.Id }, dto);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOne(Guid carId, Guid id, CancellationToken ct = default)
    {
        var dto = await documentService.GetDocumentAsync(carId, GetUserId(), id, ct);
        return Ok(dto);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid carId, Guid id, DocumentInput input, CancellationToken ct = default)
    {
        var dto = await documentService.UpdateDocumentAsync(carId, GetUserId(), id, input, ct);
        return Ok(dto);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid carId, Guid id, CancellationToken ct = default)
    {
        await documentService.DeleteDocumentAsync(carId, GetUserId(), id, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/photos/upload-url")]
    public async Task<IActionResult> GetUploadUrl(Guid carId, Guid id, CancellationToken ct = default)
    {
        var result = await documentService.GetUploadUrlAsync(carId, GetUserId(), id, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}/photos/{pictureId:guid}")]
    public async Task<IActionResult> DeletePhoto(
        Guid carId, Guid id, Guid pictureId, CancellationToken ct = default)
    {
        await documentService.RemovePhotoAsync(carId, GetUserId(), id, pictureId, ct);
        return NoContent();
    }
}

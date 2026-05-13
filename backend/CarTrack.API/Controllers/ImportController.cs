using System.Security.Claims;
using System.Text.Json;
using CarTrack.Application.Dtos.Import;
using CarTrack.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarTrack.API.Controllers;

[ApiController]
[Authorize]
[Route("api/import")]
public class ImportController(IImportService importService) : ControllerBase
{
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    [HttpPost]
    public async Task<IActionResult> Import(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "No file provided" });

        ImportBackupDto backup;
        try
        {
            using var stream = file.OpenReadStream();
            backup = await JsonSerializer.DeserializeAsync<ImportBackupDto>(stream, _jsonOptions, ct)
                ?? throw new InvalidOperationException("Empty backup");
        }
        catch
        {
            return BadRequest(new { error = "Invalid backup file format" });
        }

        if (backup.Version > 1)
            return BadRequest(new { error = $"Unsupported backup version {backup.Version}" });

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await importService.ImportAsync(backup, userId, ct);
        return Ok(result);
    }
}

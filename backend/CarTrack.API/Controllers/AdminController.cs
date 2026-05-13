using CarTrack.Application.Dtos.Admin;
using CarTrack.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarTrack.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "admin")]
public class AdminController(IAdminService adminService) : ControllerBase
{
    [HttpGet("expense-categories")]
    public async Task<IActionResult> GetExpenseCategories(CancellationToken ct = default)
        => Ok(await adminService.GetExpenseCategoriesAsync(ct));

    [HttpPost("expense-categories")]
    public async Task<IActionResult> CreateExpenseCategory(
        CreateExpenseCategoryInput input, CancellationToken ct = default)
    {
        var dto = await adminService.CreateExpenseCategoryAsync(input, ct);
        return CreatedAtAction(nameof(GetExpenseCategories), dto);
    }

    [HttpPut("expense-categories/{slug}")]
    public async Task<IActionResult> UpdateExpenseCategory(
        string slug, UpdateExpenseCategoryInput input, CancellationToken ct = default)
        => Ok(await adminService.UpdateExpenseCategoryAsync(slug, input, ct));

    [HttpDelete("expense-categories/{slug}")]
    public async Task<IActionResult> DeleteExpenseCategory(
        string slug, CancellationToken ct = default)
    {
        await adminService.DeleteExpenseCategoryAsync(slug, ct);
        return NoContent();
    }

    [HttpGet("document-kinds")]
    public async Task<IActionResult> GetDocumentKinds(CancellationToken ct = default)
        => Ok(await adminService.GetDocumentKindsAsync(ct));

    [HttpPost("document-kinds")]
    public async Task<IActionResult> CreateDocumentKind(
        CreateDocumentKindInput input, CancellationToken ct = default)
    {
        var dto = await adminService.CreateDocumentKindAsync(input, ct);
        return CreatedAtAction(nameof(GetDocumentKinds), dto);
    }

    [HttpPut("document-kinds/{slug}")]
    public async Task<IActionResult> UpdateDocumentKind(
        string slug, UpdateDocumentKindInput input, CancellationToken ct = default)
        => Ok(await adminService.UpdateDocumentKindAsync(slug, input, ct));

    [HttpDelete("document-kinds/{slug}")]
    public async Task<IActionResult> DeleteDocumentKind(
        string slug, CancellationToken ct = default)
    {
        await adminService.DeleteDocumentKindAsync(slug, ct);
        return NoContent();
    }
}

using System.Security.Claims;
using CarTrack.Application.Dtos.Expenses;
using CarTrack.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarTrack.API.Controllers;

[ApiController]
[Route("api/cars/{carId:guid}/expenses")]
[Authorize]
public class ExpensesController(IExpenseService expenseService) : ControllerBase
{
    private Guid GetUserId()
    {
        var sub = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        return Guid.Parse(sub);
    }

    [HttpGet]
    public async Task<IActionResult> List(
        Guid carId,
        [FromQuery] string? category,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var result = await expenseService.GetExpensesAsync(
            carId, GetUserId(), category, from, to, page, pageSize, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid carId, ExpenseInput input, CancellationToken ct = default)
    {
        var dto = await expenseService.CreateExpenseAsync(carId, GetUserId(), input, ct);
        return CreatedAtAction(nameof(GetOne), new { carId, id = dto.Id }, dto);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOne(Guid carId, Guid id, CancellationToken ct = default)
    {
        var dto = await expenseService.GetExpenseAsync(carId, GetUserId(), id, ct);
        return Ok(dto);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid carId, Guid id, ExpenseInput input, CancellationToken ct = default)
    {
        var dto = await expenseService.UpdateExpenseAsync(carId, GetUserId(), id, input, ct);
        return Ok(dto);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid carId, Guid id, CancellationToken ct = default)
    {
        await expenseService.DeleteExpenseAsync(carId, GetUserId(), id, ct);
        return NoContent();
    }
}

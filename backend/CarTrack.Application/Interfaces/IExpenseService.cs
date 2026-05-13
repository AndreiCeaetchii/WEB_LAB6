using CarTrack.Application.Dtos;
using CarTrack.Application.Dtos.Expenses;

namespace CarTrack.Application.Interfaces;

public interface IExpenseService
{
    Task<PaginatedResult<ExpenseDto>> GetExpensesAsync(
        Guid carId, Guid userId, string? category, DateOnly? from, DateOnly? to,
        int page, int pageSize, CancellationToken ct = default);
    Task<ExpenseDto> GetExpenseAsync(Guid carId, Guid userId, Guid expenseId, CancellationToken ct = default);
    Task<ExpenseDto> CreateExpenseAsync(Guid carId, Guid userId, ExpenseInput input, CancellationToken ct = default);
    Task<ExpenseDto> UpdateExpenseAsync(Guid carId, Guid userId, Guid expenseId, ExpenseInput input, CancellationToken ct = default);
    Task DeleteExpenseAsync(Guid carId, Guid userId, Guid expenseId, CancellationToken ct = default);
}

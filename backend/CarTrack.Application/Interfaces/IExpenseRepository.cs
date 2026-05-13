using CarTrack.Application.Dtos;
using CarTrack.Domain.Entities;

namespace CarTrack.Application.Interfaces;

public interface IExpenseRepository
{
    Task<PaginatedResult<Expense>> GetExpensesAsync(
        Guid carId, string? category, DateOnly? from, DateOnly? to,
        int page, int pageSize, CancellationToken ct = default);
    Task<Expense?> GetExpenseByCarAsync(Guid expenseId, Guid carId, CancellationToken ct = default);
    Task AddExpenseAsync(Expense expense, CancellationToken ct = default);
    Task RemoveExpenseAsync(Expense expense);
    Task SaveChangesAsync(CancellationToken ct = default);
}

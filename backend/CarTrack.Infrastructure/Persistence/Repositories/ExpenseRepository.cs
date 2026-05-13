using CarTrack.Application.Dtos;
using CarTrack.Application.Interfaces;
using CarTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CarTrack.Infrastructure.Persistence.Repositories;

public class ExpenseRepository(AppDbContext context) : IExpenseRepository
{
    public async Task<PaginatedResult<Expense>> GetExpensesAsync(
        Guid carId, string? category, DateOnly? from, DateOnly? to,
        int page, int pageSize, CancellationToken ct = default)
    {
        var query = context.Expenses.Where(e => e.CarId == carId);

        if (category is not null) query = query.Where(e => e.Category == category);
        if (from.HasValue)       query = query.Where(e => e.Date >= from.Value);
        if (to.HasValue)         query = query.Where(e => e.Date <= to.Value);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(e => e.Date)
            .ThenByDescending(e => e.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PaginatedResult<Expense>(items, total, page, pageSize);
    }

    public Task<Expense?> GetExpenseByCarAsync(Guid expenseId, Guid carId, CancellationToken ct = default)
        => context.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.CarId == carId, ct);

    public Task AddExpenseAsync(Expense expense, CancellationToken ct = default)
    {
        context.Expenses.Add(expense);
        return Task.CompletedTask;
    }

    public Task RemoveExpenseAsync(Expense expense)
    {
        context.Expenses.Remove(expense);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct = default)
        => context.SaveChangesAsync(ct);
}

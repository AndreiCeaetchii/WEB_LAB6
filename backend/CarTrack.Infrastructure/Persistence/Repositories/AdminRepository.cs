using CarTrack.Application.Interfaces;
using CarTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CarTrack.Infrastructure.Persistence.Repositories;

public class AdminRepository(AppDbContext context) : IAdminRepository
{
    public Task<List<ExpenseCategory>> GetExpenseCategoriesAsync(CancellationToken ct = default)
        => context.ExpenseCategories.OrderBy(c => c.SortOrder).ToListAsync(ct);

    public Task<ExpenseCategory?> GetExpenseCategoryAsync(string slug, CancellationToken ct = default)
        => context.ExpenseCategories.FindAsync([slug], ct).AsTask();

    public Task AddExpenseCategoryAsync(ExpenseCategory category, CancellationToken ct = default)
    {
        context.ExpenseCategories.Add(category);
        return Task.CompletedTask;
    }

    public Task RemoveExpenseCategoryAsync(ExpenseCategory category)
    {
        context.ExpenseCategories.Remove(category);
        return Task.CompletedTask;
    }

    public Task<bool> HasExpensesForCategoryAsync(string slug, CancellationToken ct = default)
        => context.Expenses.AnyAsync(e => e.Category == slug, ct);

    public Task<List<DocumentKind>> GetDocumentKindsAsync(CancellationToken ct = default)
        => context.DocumentKinds.OrderBy(k => k.SortOrder).ToListAsync(ct);

    public Task<DocumentKind?> GetDocumentKindAsync(string slug, CancellationToken ct = default)
        => context.DocumentKinds.FindAsync([slug], ct).AsTask();

    public Task AddDocumentKindAsync(DocumentKind kind, CancellationToken ct = default)
    {
        context.DocumentKinds.Add(kind);
        return Task.CompletedTask;
    }

    public Task RemoveDocumentKindAsync(DocumentKind kind)
    {
        context.DocumentKinds.Remove(kind);
        return Task.CompletedTask;
    }

    public Task<bool> HasDocumentsForKindAsync(string slug, CancellationToken ct = default)
        => context.VehicleDocuments.AnyAsync(d => d.Kind == slug, ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => context.SaveChangesAsync(ct);
}

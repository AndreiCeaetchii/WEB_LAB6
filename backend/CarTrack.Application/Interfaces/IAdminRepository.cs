using CarTrack.Domain.Entities;

namespace CarTrack.Application.Interfaces;

public interface IAdminRepository
{
    Task<List<ExpenseCategory>> GetExpenseCategoriesAsync(CancellationToken ct = default);
    Task<ExpenseCategory?> GetExpenseCategoryAsync(string slug, CancellationToken ct = default);
    Task AddExpenseCategoryAsync(ExpenseCategory category, CancellationToken ct = default);
    Task RemoveExpenseCategoryAsync(ExpenseCategory category);
    Task<bool> HasExpensesForCategoryAsync(string slug, CancellationToken ct = default);
    Task<List<DocumentKind>> GetDocumentKindsAsync(CancellationToken ct = default);
    Task<DocumentKind?> GetDocumentKindAsync(string slug, CancellationToken ct = default);
    Task AddDocumentKindAsync(DocumentKind kind, CancellationToken ct = default);
    Task RemoveDocumentKindAsync(DocumentKind kind);
    Task<bool> HasDocumentsForKindAsync(string slug, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}

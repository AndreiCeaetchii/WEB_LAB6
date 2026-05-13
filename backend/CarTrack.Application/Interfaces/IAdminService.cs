using CarTrack.Application.Dtos.Admin;

namespace CarTrack.Application.Interfaces;

public interface IAdminService
{
    Task<List<ExpenseCategoryDto>> GetExpenseCategoriesAsync(CancellationToken ct = default);
    Task<ExpenseCategoryDto> CreateExpenseCategoryAsync(CreateExpenseCategoryInput input, CancellationToken ct = default);
    Task<ExpenseCategoryDto> UpdateExpenseCategoryAsync(string slug, UpdateExpenseCategoryInput input, CancellationToken ct = default);
    Task DeleteExpenseCategoryAsync(string slug, CancellationToken ct = default);
    Task<List<DocumentKindDto>> GetDocumentKindsAsync(CancellationToken ct = default);
    Task<DocumentKindDto> CreateDocumentKindAsync(CreateDocumentKindInput input, CancellationToken ct = default);
    Task<DocumentKindDto> UpdateDocumentKindAsync(string slug, UpdateDocumentKindInput input, CancellationToken ct = default);
    Task DeleteDocumentKindAsync(string slug, CancellationToken ct = default);
}

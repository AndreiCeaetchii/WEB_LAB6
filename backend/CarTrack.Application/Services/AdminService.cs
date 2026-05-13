using CarTrack.Application.Dtos.Admin;
using CarTrack.Application.Exceptions;
using CarTrack.Application.Interfaces;
using CarTrack.Domain.Entities;

namespace CarTrack.Application.Services;

public class AdminService(IAdminRepository adminRepository) : IAdminService
{
    public async Task<List<ExpenseCategoryDto>> GetExpenseCategoriesAsync(CancellationToken ct = default)
    {
        var categories = await adminRepository.GetExpenseCategoriesAsync(ct);
        return categories.Select(c => new ExpenseCategoryDto(c.Slug, c.Label, c.Icon, c.IsSystem, c.SortOrder)).ToList();
    }

    public async Task<ExpenseCategoryDto> CreateExpenseCategoryAsync(
        CreateExpenseCategoryInput input, CancellationToken ct = default)
    {
        var existing = await adminRepository.GetExpenseCategoryAsync(input.Slug, ct);
        if (existing is not null) throw new ConflictException($"Category '{input.Slug}' already exists");

        var category = new ExpenseCategory
        {
            Slug      = input.Slug,
            Label     = input.Label,
            Icon      = input.Icon,
            IsSystem  = false,
            SortOrder = input.SortOrder
        };
        await adminRepository.AddExpenseCategoryAsync(category, ct);
        await adminRepository.SaveChangesAsync(ct);
        return new ExpenseCategoryDto(category.Slug, category.Label, category.Icon, category.IsSystem, category.SortOrder);
    }

    public async Task<ExpenseCategoryDto> UpdateExpenseCategoryAsync(
        string slug, UpdateExpenseCategoryInput input, CancellationToken ct = default)
    {
        var category = await adminRepository.GetExpenseCategoryAsync(slug, ct)
            ?? throw new NotFoundException($"Category '{slug}' not found");

        category.Label     = input.Label;
        category.Icon      = input.Icon;
        category.SortOrder = input.SortOrder;
        await adminRepository.SaveChangesAsync(ct);
        return new ExpenseCategoryDto(category.Slug, category.Label, category.Icon, category.IsSystem, category.SortOrder);
    }

    public async Task DeleteExpenseCategoryAsync(string slug, CancellationToken ct = default)
    {
        var category = await adminRepository.GetExpenseCategoryAsync(slug, ct)
            ?? throw new NotFoundException($"Category '{slug}' not found");

        if (category.IsSystem)
            throw new BadRequestException("Cannot delete a system expense category");
        if (await adminRepository.HasExpensesForCategoryAsync(slug, ct))
            throw new ConflictException("Cannot delete a category that has existing expenses");

        await adminRepository.RemoveExpenseCategoryAsync(category);
        await adminRepository.SaveChangesAsync(ct);
    }

    public async Task<List<DocumentKindDto>> GetDocumentKindsAsync(CancellationToken ct = default)
    {
        var kinds = await adminRepository.GetDocumentKindsAsync(ct);
        return kinds.Select(k => new DocumentKindDto(k.Slug, k.Label, k.IsSystem, k.SortOrder)).ToList();
    }

    public async Task<DocumentKindDto> CreateDocumentKindAsync(
        CreateDocumentKindInput input, CancellationToken ct = default)
    {
        var existing = await adminRepository.GetDocumentKindAsync(input.Slug, ct);
        if (existing is not null) throw new ConflictException($"Document kind '{input.Slug}' already exists");

        var kind = new DocumentKind
        {
            Slug      = input.Slug,
            Label     = input.Label,
            IsSystem  = false,
            SortOrder = input.SortOrder
        };
        await adminRepository.AddDocumentKindAsync(kind, ct);
        await adminRepository.SaveChangesAsync(ct);
        return new DocumentKindDto(kind.Slug, kind.Label, kind.IsSystem, kind.SortOrder);
    }

    public async Task<DocumentKindDto> UpdateDocumentKindAsync(
        string slug, UpdateDocumentKindInput input, CancellationToken ct = default)
    {
        var kind = await adminRepository.GetDocumentKindAsync(slug, ct)
            ?? throw new NotFoundException($"Document kind '{slug}' not found");

        kind.Label     = input.Label;
        kind.SortOrder = input.SortOrder;
        await adminRepository.SaveChangesAsync(ct);
        return new DocumentKindDto(kind.Slug, kind.Label, kind.IsSystem, kind.SortOrder);
    }

    public async Task DeleteDocumentKindAsync(string slug, CancellationToken ct = default)
    {
        var kind = await adminRepository.GetDocumentKindAsync(slug, ct)
            ?? throw new NotFoundException($"Document kind '{slug}' not found");

        if (kind.IsSystem)
            throw new BadRequestException("Cannot delete a system document kind");
        if (await adminRepository.HasDocumentsForKindAsync(slug, ct))
            throw new ConflictException("Cannot delete a document kind that has existing documents");

        await adminRepository.RemoveDocumentKindAsync(kind);
        await adminRepository.SaveChangesAsync(ct);
    }
}

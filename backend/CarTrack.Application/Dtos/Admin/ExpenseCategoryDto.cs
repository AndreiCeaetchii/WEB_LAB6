namespace CarTrack.Application.Dtos.Admin;

public record ExpenseCategoryDto(string Slug, string Label, string? Icon, bool IsSystem, int SortOrder);

namespace CarTrack.Application.Dtos.Admin;

public record DocumentKindDto(string Slug, string Label, bool IsSystem, int SortOrder);

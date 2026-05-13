namespace CarTrack.Application.Dtos.Documents;

public record DocumentDto(
    Guid Id,
    Guid CarId,
    string Kind,
    string Insurer,
    string PolicyNumber,
    DateOnly StartDate,
    DateOnly EndDate,
    decimal Cost,
    string? Note,
    IReadOnlyList<string> PhotoUrls,
    DateTime CreatedAt,
    DateTime UpdatedAt);

namespace CarTrack.Application.Dtos;

public record PaginatedResult<T>(
    IReadOnlyList<T> Items,
    int Total,
    int Page,
    int PageSize);

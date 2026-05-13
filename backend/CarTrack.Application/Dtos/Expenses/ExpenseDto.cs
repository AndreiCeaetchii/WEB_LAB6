namespace CarTrack.Application.Dtos.Expenses;

public record ExpenseDto(
    Guid Id,
    Guid CarId,
    string Category,
    DateOnly Date,
    decimal Cost,
    string? Note,
    string? FuelUnit,
    decimal? FuelQuantity,
    decimal? FuelUnitPrice,
    int? OdometerKm,
    string? RepairDescription,
    string? Mechanic,
    string? PartName,
    int? PartsQuantity,
    DateOnly? NextDueDate,
    string? OtherDescription,
    DateTime CreatedAt,
    DateTime UpdatedAt);

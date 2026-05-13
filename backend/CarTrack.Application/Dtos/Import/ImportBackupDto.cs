namespace CarTrack.Application.Dtos.Import;

public record ImportCarDto(
    string Id,
    string Make,
    string Model,
    int Year,
    string Vin,
    string LicensePlate,
    string AccentId,
    bool IsElectric,
    bool Favorite,
    long CreatedAt,
    long UpdatedAt,
    string? Photo);

public record ImportExpenseDto(
    string Id,
    string CarId,
    string Category,
    string Date,
    decimal Cost,
    string? Note,
    long CreatedAt,
    long UpdatedAt,
    // fuel
    string? Unit,
    decimal? Quantity,
    decimal? UnitPrice,
    int? OdometerKm,
    // repair / other
    string? Description,
    string? Mechanic,
    // parts
    string? PartName,
    int? PartsQuantity,
    // inspection
    string? NextDueDate);

public record ImportDocumentDto(
    string Id,
    string CarId,
    string Kind,
    string Insurer,
    string PolicyNumber,
    string StartDate,
    string EndDate,
    decimal Cost,
    string? Note,
    long CreatedAt,
    long UpdatedAt,
    List<string>? Photos);

public record ImportBackupDto(
    int Version,
    string ExportedAt,
    List<ImportCarDto>? Cars,
    List<ImportExpenseDto>? Expenses,
    List<ImportDocumentDto>? Documents);

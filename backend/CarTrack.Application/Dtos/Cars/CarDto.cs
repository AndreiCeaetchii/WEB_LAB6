namespace CarTrack.Application.Dtos.Cars;

public record CarDto(
    Guid Id,
    string Make,
    string Model,
    int Year,
    string Vin,
    string LicensePlate,
    string AccentId,
    bool IsElectric,
    bool Favorite,
    IReadOnlyList<string> PhotoUrls,
    DateTime CreatedAt,
    DateTime UpdatedAt);

using System.ComponentModel.DataAnnotations;

namespace CarTrack.Application.Dtos.Cars;

public class CarInput
{
    [Required] public string Make { get; set; } = string.Empty;
    [Required] public string Model { get; set; } = string.Empty;
    [Required, Range(1900, 2100)] public int Year { get; set; }
    public string Vin { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    [Required] public string AccentId { get; set; } = string.Empty;
    public bool IsElectric { get; set; }
    public bool Favorite { get; set; }
}

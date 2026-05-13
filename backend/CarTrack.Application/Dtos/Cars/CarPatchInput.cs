namespace CarTrack.Application.Dtos.Cars;

public class CarPatchInput
{
    public string? Make { get; set; }
    public string? Model { get; set; }
    public int? Year { get; set; }
    public string? Vin { get; set; }
    public string? LicensePlate { get; set; }
    public string? AccentId { get; set; }
    public bool? IsElectric { get; set; }
    public bool? Favorite { get; set; }
    public Guid? PictureId { get; set; }
}

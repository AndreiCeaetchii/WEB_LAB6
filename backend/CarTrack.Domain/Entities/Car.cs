namespace CarTrack.Domain.Entities;

public class Car
{
    public Guid Id { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Vin { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string AccentId { get; set; } = string.Empty;
    public bool IsElectric { get; set; }
    public bool Favorite { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<CarUser> CarUsers { get; set; } = [];
    public ICollection<CarPicture> CarPictures { get; set; } = [];
    public ICollection<Expense> Expenses { get; set; } = [];
    public ICollection<CarDocument> CarDocuments { get; set; } = [];
    public ICollection<CarShare> CarShares { get; set; } = [];
}

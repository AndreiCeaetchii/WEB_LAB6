namespace CarTrack.Domain.Entities;

public class VehicleDocument
{
    public Guid Id { get; set; }
    public string Kind { get; set; } = string.Empty;
    public DocumentKind KindNavigation { get; set; } = null!;
    public string Insurer { get; set; } = string.Empty;
    public string PolicyNumber { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal Cost { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<CarDocument> CarDocuments { get; set; } = [];
    public ICollection<DocumentPicture> DocumentPictures { get; set; } = [];
}

namespace CarTrack.Domain.Entities;

public class Picture
{
    public Guid Id { get; set; }
    public string ObjectKey { get; set; } = string.Empty;
    public string MimeType { get; set; } = "image/webp";
    public int? SizeBytes { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<CarPicture> CarPictures { get; set; } = [];
    public ICollection<DocumentPicture> DocumentPictures { get; set; } = [];
}

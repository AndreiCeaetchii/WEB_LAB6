namespace CarTrack.Domain.Entities;

public class DocumentPicture
{
    public Guid DocumentId { get; set; }
    public VehicleDocument Document { get; set; } = null!;
    public Guid PictureId { get; set; }
    public Picture Picture { get; set; } = null!;
    public int SortOrder { get; set; }
}

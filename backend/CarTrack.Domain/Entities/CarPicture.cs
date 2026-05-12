namespace CarTrack.Domain.Entities;

public class CarPicture
{
    public Guid CarId { get; set; }
    public Car Car { get; set; } = null!;
    public Guid PictureId { get; set; }
    public Picture Picture { get; set; } = null!;
    public string Kind { get; set; } = "registration";
    public int SortOrder { get; set; }
}

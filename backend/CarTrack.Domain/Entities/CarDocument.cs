namespace CarTrack.Domain.Entities;

public class CarDocument
{
    public Guid CarId { get; set; }
    public Car Car { get; set; } = null!;
    public Guid DocumentId { get; set; }
    public VehicleDocument Document { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

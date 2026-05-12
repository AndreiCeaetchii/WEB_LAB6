namespace CarTrack.Domain.Entities;

public class CarUser
{
    public Guid CarId { get; set; }
    public Car Car { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Role { get; set; } = "collaborator";
    public DateTime CreatedAt { get; set; }
}

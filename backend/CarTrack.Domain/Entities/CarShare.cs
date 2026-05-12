namespace CarTrack.Domain.Entities;

public class CarShare
{
    public Guid Id { get; set; }
    public Guid CarId { get; set; }
    public Car Car { get; set; } = null!;
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RedeemedAt { get; set; }
    public Guid? RedeemedBy { get; set; }
    public User? RedeemedByUser { get; set; }
    public DateTime CreatedAt { get; set; }
}

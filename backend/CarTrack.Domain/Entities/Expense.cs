namespace CarTrack.Domain.Entities;

public abstract class Expense
{
    public Guid Id { get; set; }
    public Guid CarId { get; set; }
    public Car Car { get; set; } = null!;
    // EF Core TPH discriminator — value must match expense_categories.slug
    public string Category { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public decimal Cost { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class FuelExpense : Expense
{
    public string FuelUnit { get; set; } = "L";
    public decimal FuelQuantity { get; set; }
    public decimal FuelUnitPrice { get; set; }
    public int? OdometerKm { get; set; }
}

public class RepairExpense : Expense
{
    public string RepairDescription { get; set; } = string.Empty;
    public string? Mechanic { get; set; }
}

public class PartsExpense : Expense
{
    public string PartName { get; set; } = string.Empty;
    public int PartsQuantity { get; set; }
}

public class InspectionExpense : Expense
{
    public DateOnly? NextDueDate { get; set; }
}

public class OtherExpense : Expense
{
    public string? OtherDescription { get; set; }
}

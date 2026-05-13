using System.ComponentModel.DataAnnotations;

namespace CarTrack.Application.Dtos.Expenses;

public class ExpenseInput
{
    [Required] public string Category { get; set; } = string.Empty;
    [Required] public DateOnly Date { get; set; }
    public decimal Cost { get; set; }
    public string? Note { get; set; }
    public string? FuelUnit { get; set; }
    public decimal? FuelQuantity { get; set; }
    public decimal? FuelUnitPrice { get; set; }
    public int? OdometerKm { get; set; }
    public string? RepairDescription { get; set; }
    public string? Mechanic { get; set; }
    public string? PartName { get; set; }
    public int? PartsQuantity { get; set; }
    public DateOnly? NextDueDate { get; set; }
    public string? OtherDescription { get; set; }
}

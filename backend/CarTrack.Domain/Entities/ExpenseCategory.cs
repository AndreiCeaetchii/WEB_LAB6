namespace CarTrack.Domain.Entities;

public class ExpenseCategory
{
    public string Slug { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public bool IsSystem { get; set; }
    public int SortOrder { get; set; }
}

using System.ComponentModel.DataAnnotations;

namespace CarTrack.Application.Dtos.Admin;

public class CreateExpenseCategoryInput
{
    [Required] public string Slug { get; set; } = string.Empty;
    [Required] public string Label { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public int SortOrder { get; set; }
}

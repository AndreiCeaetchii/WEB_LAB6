using System.ComponentModel.DataAnnotations;

namespace CarTrack.Application.Dtos.Documents;

public class DocumentInput
{
    [Required] public string Kind { get; set; } = string.Empty;
    [Required] public string Insurer { get; set; } = string.Empty;
    [Required] public string PolicyNumber { get; set; } = string.Empty;
    [Required] public DateOnly StartDate { get; set; }
    [Required] public DateOnly EndDate { get; set; }
    public decimal Cost { get; set; }
    public string? Note { get; set; }
}

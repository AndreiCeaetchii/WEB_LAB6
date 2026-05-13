using System.ComponentModel.DataAnnotations;

namespace CarTrack.Application.Dtos.Admin;

public class CreateDocumentKindInput
{
    [Required] public string Slug { get; set; } = string.Empty;
    [Required] public string Label { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

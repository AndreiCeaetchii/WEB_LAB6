using System.ComponentModel.DataAnnotations;

namespace CarTrack.Application.Dtos.Admin;

public class UpdateDocumentKindInput
{
    [Required] public string Label { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

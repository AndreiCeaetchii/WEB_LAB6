namespace CarTrack.Domain.Entities;

public class DocumentKind
{
    public string Slug { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public bool IsSystem { get; set; }
    public int SortOrder { get; set; }
}

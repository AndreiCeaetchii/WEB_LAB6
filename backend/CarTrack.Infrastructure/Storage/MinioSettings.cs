namespace CarTrack.Infrastructure.Storage;

public class MinioSettings
{
    public string Endpoint { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string Bucket { get; set; } = string.Empty;
    public bool UseSSL { get; set; } = false;
    public string PublicEndpoint { get; set; } = string.Empty;
}

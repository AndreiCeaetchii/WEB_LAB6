using Amazon.S3;
using Amazon.S3.Model;
using CarTrack.Domain.Interfaces;

namespace CarTrack.Infrastructure.Storage;

public class MinioStorageService : IStorageService
{
    private readonly MinioSettings _settings;
    private readonly AmazonS3Client _s3;

    public MinioStorageService(MinioSettings settings)
    {
        _settings = settings;
        var config = new AmazonS3Config
        {
            ServiceURL = $"http{(settings.UseSSL ? "s" : "")}://{settings.Endpoint}",
            ForcePathStyle = true
        };
        _s3 = new AmazonS3Client(settings.AccessKey, settings.SecretKey, config);
    }

    public Task<string> GenerateUploadUrlAsync(string objectKey, int expiryMinutes = 5)
    {
        var url = _s3.GetPreSignedURL(new GetPreSignedUrlRequest
        {
            BucketName = _settings.Bucket,
            Key = objectKey,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.AddMinutes(expiryMinutes)
        });
        return Task.FromResult(SubstitutePublicEndpoint(url));
    }

    public Task<string> GenerateDownloadUrlAsync(string objectKey, int expiryHours = 1)
    {
        var url = _s3.GetPreSignedURL(new GetPreSignedUrlRequest
        {
            BucketName = _settings.Bucket,
            Key = objectKey,
            Verb = HttpVerb.GET,
            Expires = DateTime.UtcNow.AddHours(expiryHours)
        });
        return Task.FromResult(SubstitutePublicEndpoint(url));
    }

    public async Task DeleteObjectAsync(string objectKey)
        => await _s3.DeleteObjectAsync(_settings.Bucket, objectKey);

    public async Task UploadAsync(string objectKey, Stream data, string contentType, CancellationToken ct = default)
        => await _s3.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _settings.Bucket,
            Key = objectKey,
            InputStream = data,
            ContentType = contentType
        }, ct);

    public string BuildObjectKey(string prefix, Guid ownerId, Guid entityId, string filename)
        => $"{prefix}/{ownerId}/{entityId}/{filename}";

    private string SubstitutePublicEndpoint(string url)
    {
        if (string.IsNullOrEmpty(_settings.PublicEndpoint)) return url;
        var internalBase = $"http{(_settings.UseSSL ? "s" : "")}://{_settings.Endpoint}";
        return url.Replace(internalBase, _settings.PublicEndpoint.TrimEnd('/'));
    }
}

namespace CarTrack.Domain.Interfaces;

public interface IStorageService
{
    Task<string> GenerateUploadUrlAsync(string objectKey, int expiryMinutes = 5);
    Task<string> GenerateDownloadUrlAsync(string objectKey, int expiryHours = 1);
    Task DeleteObjectAsync(string objectKey);
    string BuildObjectKey(string prefix, Guid ownerId, Guid entityId, string filename);
    Task UploadAsync(string objectKey, Stream data, string contentType, CancellationToken ct = default);
}

using CarTrack.Domain.Interfaces;

namespace CarTrack.Tests.Fakes;

public class FakeStorageService : IStorageService
{
    public Task<string> GenerateUploadUrlAsync(string objectKey, int expiryMinutes = 5)
        => Task.FromResult($"https://fake-storage/upload/{objectKey}");

    public Task<string> GenerateDownloadUrlAsync(string objectKey, int expiryHours = 1)
        => Task.FromResult($"https://fake-storage/{objectKey}");

    public Task DeleteObjectAsync(string objectKey) => Task.CompletedTask;

    public Task UploadAsync(string objectKey, Stream data, string contentType, CancellationToken ct = default)
        => Task.CompletedTask;

    public string BuildObjectKey(string prefix, Guid ownerId, Guid entityId, string filename)
        => $"{prefix}/{ownerId}/{entityId}/{filename}";
}

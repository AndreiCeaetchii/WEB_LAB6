using CarTrack.Tests.Fakes;

namespace CarTrack.Tests.Unit;

public class FakeStorageServiceTests
{
    private readonly FakeStorageService _svc = new();

    [Fact]
    public void BuildObjectKey_ReturnsExpectedPattern()
    {
        var userId = Guid.NewGuid();
        var carId = Guid.NewGuid();
        var picId = Guid.NewGuid();

        var key = _svc.BuildObjectKey("cars", userId, carId, $"{picId}.webp");

        Assert.Equal($"cars/{userId}/{carId}/{picId}.webp", key);
    }

    [Fact]
    public async Task GenerateUploadUrlAsync_ReturnsNonEmptyUrl()
    {
        var url = await _svc.GenerateUploadUrlAsync("cars/a/b/c.webp");
        Assert.False(string.IsNullOrEmpty(url));
    }

    [Fact]
    public async Task GenerateDownloadUrlAsync_ReturnsNonEmptyUrl()
    {
        var url = await _svc.GenerateDownloadUrlAsync("cars/a/b/c.webp");
        Assert.False(string.IsNullOrEmpty(url));
    }
}

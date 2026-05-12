using System.Net;
using FluentAssertions;

namespace CarTrack.Tests.API;

public class HealthEndpointTests(CustomWebApplicationFactory factory)
    : IClassFixture<CustomWebApplicationFactory>
{
    [Fact]
    public async Task GetHealth_ReturnsOk()
    {
        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/health");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetHealth_ReturnsStatusOk()
    {
        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/health");
        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("ok");
    }
}

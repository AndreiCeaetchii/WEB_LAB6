using System.Net;
using System.Net.Http.Json;

namespace CarTrack.Tests.API.Auth;

public class TokenEndpointTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task PostToken_WithAdminRole_Returns200WithJwt()
    {
        var response = await _client.PostAsJsonAsync("/token", new { role = "admin" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
        Assert.NotNull(body);
        Assert.True(body.ContainsKey("accessToken"));
        Assert.False(string.IsNullOrEmpty(body["accessToken"]));
    }

    [Fact]
    public async Task GetToken_WithUserRoleQuery_Returns200WithJwt()
    {
        var response = await _client.GetAsync("/token?role=user");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task PostToken_WithInvalidRole_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/token", new { role = "superadmin" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}

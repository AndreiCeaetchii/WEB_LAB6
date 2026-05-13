using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using CarTrack.Application.Dtos.Auth;

namespace CarTrack.Tests.API.Auth;

public class MeTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    [Fact]
    public async Task Me_WithValidBearer_Returns200WithUserInfo()
    {
        var client = factory.CreateClient();
        var reg = await client.PostAsJsonAsync("/api/auth/register",
            new { email = "me@example.com", password = "Password1!" });
        var tokens = (await reg.Content.ReadFromJsonAsync<TokenResponse>())!;
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", tokens.AccessToken);

        var response = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<UserDto>();
        Assert.NotNull(body);
        Assert.Equal("me@example.com", body.Email);
        Assert.Equal("user", body.Role);
    }

    [Fact]
    public async Task Me_WithoutBearer_Returns401()
    {
        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}

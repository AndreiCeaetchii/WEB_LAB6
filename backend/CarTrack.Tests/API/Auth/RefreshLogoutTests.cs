using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using CarTrack.Application.Dtos.Auth;

namespace CarTrack.Tests.API.Auth;

public class RefreshLogoutTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    private async Task<TokenResponse> RegisterAndGetTokens(string email)
    {
        var resp = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email,
            password = "Password1!"
        });
        return (await resp.Content.ReadFromJsonAsync<TokenResponse>())!;
    }

    [Fact]
    public async Task Refresh_WithValidToken_Returns200WithNewTokens()
    {
        var initial = await RegisterAndGetTokens("r1@example.com");

        var response = await _client.PostAsJsonAsync("/api/auth/refresh",
            new { refreshToken = initial.RefreshToken });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<TokenResponse>();
        Assert.NotNull(body);
        Assert.NotEqual(initial.AccessToken, body.AccessToken);
        Assert.NotEqual(initial.RefreshToken, body.RefreshToken);
    }

    [Fact]
    public async Task Refresh_WithRotatedToken_Returns401()
    {
        var initial = await RegisterAndGetTokens("r2@example.com");
        await _client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = initial.RefreshToken });

        var response = await _client.PostAsJsonAsync("/api/auth/refresh",
            new { refreshToken = initial.RefreshToken });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Refresh_WithInvalidToken_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/refresh",
            new { refreshToken = "not-a-real-token" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logout_WithValidBearer_Returns204()
    {
        var tokens = await RegisterAndGetTokens("r3@example.com");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", tokens.AccessToken);

        var response = await _client.DeleteAsync(
            "/api/auth/logout?refreshToken=" + Uri.EscapeDataString(tokens.RefreshToken));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Logout_ThenRefresh_Returns401()
    {
        var tokens = await RegisterAndGetTokens("r4@example.com");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", tokens.AccessToken);

        await _client.DeleteAsync(
            "/api/auth/logout?refreshToken=" + Uri.EscapeDataString(tokens.RefreshToken));

        var client2 = factory.CreateClient();
        var refreshResp = await client2.PostAsJsonAsync("/api/auth/refresh",
            new { refreshToken = tokens.RefreshToken });

        Assert.Equal(HttpStatusCode.Unauthorized, refreshResp.StatusCode);
    }
}

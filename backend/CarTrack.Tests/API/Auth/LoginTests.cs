using System.Net;
using System.Net.Http.Json;
using CarTrack.Application.Dtos.Auth;

namespace CarTrack.Tests.API.Auth;

public class LoginTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Login_WithValidCredentials_Returns200WithTokens()
    {
        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email = "logintest@example.com",
            password = "Password1!"
        });

        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "logintest@example.com",
            password = "Password1!"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<TokenResponse>();
        Assert.NotNull(body);
        Assert.False(string.IsNullOrEmpty(body.AccessToken));
        Assert.False(string.IsNullOrEmpty(body.RefreshToken));
    }

    [Fact]
    public async Task Login_WithWrongPassword_Returns401()
    {
        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email = "wrongpw@example.com",
            password = "Password1!"
        });

        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "wrongpw@example.com",
            password = "WrongPassword!"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithUnknownEmail_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "nobody@example.com",
            password = "Password1!"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}

using System.Net;
using System.Net.Http.Json;
using CarTrack.Application.Dtos.Auth;

namespace CarTrack.Tests.API.Auth;

public class RegisterTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Register_WithValidData_Returns200WithTokens()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email = "user@example.com",
            password = "Password1!"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<TokenResponse>();
        Assert.NotNull(body);
        Assert.False(string.IsNullOrEmpty(body.AccessToken));
        Assert.False(string.IsNullOrEmpty(body.RefreshToken));
        Assert.Equal("user@example.com", body.User.Email);
        Assert.Equal("user", body.User.Role);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_Returns409()
    {
        var payload = new { email = "dup@example.com", password = "Password1!" };
        await _client.PostAsJsonAsync("/api/auth/register", payload);

        var response = await _client.PostAsJsonAsync("/api/auth/register", payload);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Register_WithShortPassword_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email = "short@example.com",
            password = "abc"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}

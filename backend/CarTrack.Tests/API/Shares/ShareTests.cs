using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using CarTrack.Application.Dtos.Auth;
using CarTrack.Application.Dtos.Cars;
using CarTrack.Application.Dtos.Shares;

namespace CarTrack.Tests.API.Shares;

public class ShareTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private async Task<(HttpClient Client, string AccessToken)> RegisterAndAuth(string email)
    {
        var client = factory.CreateClient();
        var resp = await client.PostAsJsonAsync("/api/auth/register",
            new { email, password = "Password1!" });
        var tokens = (await resp.Content.ReadFromJsonAsync<TokenResponse>())!;
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        return (client, tokens.AccessToken);
    }

    private static object DefaultCar() =>
        new { make = "Toyota", model = "Corolla", year = 2020, accentId = "blue" };

    [Fact]
    public async Task CreateShare_ByOwner_Returns200WithQrCode()
    {
        var (client, _) = await RegisterAndAuth("share_create@example.com");
        var carResp = await client.PostAsJsonAsync("/api/cars", DefaultCar());
        var car = (await carResp.Content.ReadFromJsonAsync<CarDto>())!;

        var resp = await client.PostAsJsonAsync($"/api/cars/{car.Id}/shares", new { });

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<ShareTokenResponse>();
        Assert.NotNull(body);
        Assert.False(string.IsNullOrEmpty(body.Token));
        Assert.Contains("/share/", body.Url);
        Assert.False(string.IsNullOrEmpty(body.QrPngBase64));
        Assert.True(body.ExpiresAt > DateTime.UtcNow);
    }
}

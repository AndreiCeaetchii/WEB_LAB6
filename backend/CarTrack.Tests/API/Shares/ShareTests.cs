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

    private async Task<(HttpClient Client, Guid CarId, string Token)> CreateCarWithShare(string email)
    {
        var (client, _) = await RegisterAndAuth(email);
        var carResp = await client.PostAsJsonAsync("/api/cars", DefaultCar());
        var car = (await carResp.Content.ReadFromJsonAsync<CarDto>())!;
        var shareResp = await client.PostAsJsonAsync($"/api/cars/{car.Id}/shares", new { });
        var share = (await shareResp.Content.ReadFromJsonAsync<ShareTokenResponse>())!;
        return (client, car.Id, share.Token);
    }

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

    [Fact]
    public async Task CreateShare_ByNonOwner_Returns403()
    {
        var (ownerClient, carId, _) = await CreateCarWithShare("share_owner@example.com");
        var (nonOwnerClient, _) = await RegisterAndAuth("share_nonowner@example.com");

        var resp = await nonOwnerClient.PostAsJsonAsync($"/api/cars/{carId}/shares", new { });

        Assert.Equal(HttpStatusCode.Forbidden, resp.StatusCode);
    }

    [Fact]
    public async Task GetPreview_ValidToken_Returns200WithCarInfo()
    {
        var (_, _, token) = await CreateCarWithShare("share_preview@example.com");
        var anonClient = factory.CreateClient();

        var resp = await anonClient.GetAsync($"/api/shares/{token}");

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<CarPreviewResponse>();
        Assert.NotNull(body);
        Assert.Equal("Toyota", body.Make);
        Assert.Equal("Corolla", body.Model);
        Assert.Equal(2020, body.Year);
        Assert.False(string.IsNullOrEmpty(body.OwnerEmail));
    }

    [Fact]
    public async Task GetPreview_InvalidToken_Returns404()
    {
        var anonClient = factory.CreateClient();

        var resp = await anonClient.GetAsync("/api/shares/nonexistent-token-xxx");

        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    [Fact]
    public async Task RedeemShare_ByNewUser_Returns200AndAddsCollaborator()
    {
        var (_, carId, token) = await CreateCarWithShare("share_redeem_owner@example.com");
        var (redeemerClient, _) = await RegisterAndAuth("share_redeemer@example.com");

        var resp = await redeemerClient.PostAsJsonAsync($"/api/shares/{token}/redeem", new { });

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<Dictionary<string, Guid>>();
        Assert.NotNull(body);
        Assert.True(body.ContainsKey("carId"));
        Assert.Equal(carId, body["carId"]);

        // Verify collaborator can now list the car
        var carsResp = await redeemerClient.GetAsync("/api/cars");
        var cars = await carsResp.Content.ReadFromJsonAsync<CarTrack.Application.Dtos.PaginatedResult<CarDto>>();
        Assert.NotNull(cars);
        Assert.Contains(cars.Items, c => c.Id == carId);
    }

    [Fact]
    public async Task RedeemShare_AlreadyRedeemed_Returns409()
    {
        var (_, _, token) = await CreateCarWithShare("share_redeemed_owner@example.com");
        var (firstRedeemerClient, _) = await RegisterAndAuth("share_redeemer1@example.com");
        var (secondRedeemerClient, _) = await RegisterAndAuth("share_redeemer2@example.com");

        await firstRedeemerClient.PostAsJsonAsync($"/api/shares/{token}/redeem", new { });

        var resp = await secondRedeemerClient.PostAsJsonAsync($"/api/shares/{token}/redeem", new { });

        Assert.Equal(HttpStatusCode.Conflict, resp.StatusCode);
    }

    [Fact]
    public async Task ListShares_ByOwner_ReturnsActiveShares()
    {
        var (client, carId, token) = await CreateCarWithShare("share_list@example.com");

        var resp = await client.GetAsync($"/api/cars/{carId}/shares");

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<List<ShareInfoDto>>();
        Assert.NotNull(body);
        Assert.Single(body);
        Assert.Equal(token, body[0].Token);
    }

    [Fact]
    public async Task RevokeShare_ByOwner_Returns204()
    {
        var (client, _, token) = await CreateCarWithShare("share_revoke@example.com");

        var resp = await client.DeleteAsync($"/api/shares/{token}");

        Assert.Equal(HttpStatusCode.NoContent, resp.StatusCode);
    }
}

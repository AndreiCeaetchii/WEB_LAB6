using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using CarTrack.Application.Dtos;
using CarTrack.Application.Dtos.Auth;
using CarTrack.Application.Dtos.Cars;
using CarTrack.Application.Dtos.Documents;

namespace CarTrack.Tests.API.Documents;

public class DocumentsCrudTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private async Task<(HttpClient client, Guid carId)> SetupAsync(string email)
    {
        var client = factory.CreateClient();
        var reg = await client.PostAsJsonAsync("/api/auth/register",
            new { email, password = "Password1!" });
        var tokens = (await reg.Content.ReadFromJsonAsync<TokenResponse>())!;
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", tokens.AccessToken);

        var carResp = await client.PostAsJsonAsync("/api/cars", new
        {
            make = "Dacia", model = "Logan", year = 2021,
            vin = "", licensePlate = "", accentId = "red",
            isElectric = false, favorite = false
        });
        var car = (await carResp.Content.ReadFromJsonAsync<CarDto>())!;
        return (client, car.Id);
    }

    private static object DocInput() => new
    {
        kind = "rca", insurer = "Allianz", policyNumber = "RCA-001",
        startDate = "2024-01-01", endDate = "2025-01-01",
        cost = 350.00m, note = (string?)null
    };

    [Fact]
    public async Task ListDocuments_Empty_Returns200()
    {
        var (client, carId) = await SetupAsync("d1@example.com");
        var resp = await client.GetAsync($"/api/cars/{carId}/documents");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<PaginatedResult<DocumentDto>>();
        Assert.Equal(0, body!.Total);
    }

    [Fact]
    public async Task CreateDocument_Returns201()
    {
        var (client, carId) = await SetupAsync("d2@example.com");
        var resp = await client.PostAsJsonAsync($"/api/cars/{carId}/documents", DocInput());
        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<DocumentDto>();
        Assert.NotNull(body);
        Assert.Equal("rca", body.Kind);
        Assert.Equal("Allianz", body.Insurer);
    }

    [Fact]
    public async Task GetDocument_Returns200()
    {
        var (client, carId) = await SetupAsync("d3@example.com");
        var created = (await (await client.PostAsJsonAsync(
            $"/api/cars/{carId}/documents", DocInput())).Content
            .ReadFromJsonAsync<DocumentDto>())!;

        var resp = await client.GetAsync($"/api/cars/{carId}/documents/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<DocumentDto>();
        Assert.Equal(created.Id, body!.Id);
    }

    [Fact]
    public async Task UpdateDocument_Returns200()
    {
        var (client, carId) = await SetupAsync("d4@example.com");
        var created = (await (await client.PostAsJsonAsync(
            $"/api/cars/{carId}/documents", DocInput())).Content
            .ReadFromJsonAsync<DocumentDto>())!;

        var resp = await client.PutAsJsonAsync($"/api/cars/{carId}/documents/{created.Id}", new
        {
            kind = "cartea-verde", insurer = "Generali", policyNumber = "CV-002",
            startDate = "2024-06-01", endDate = "2025-06-01",
            cost = 120.00m, note = (string?)null
        });
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<DocumentDto>();
        Assert.Equal("cartea-verde", body!.Kind);
        Assert.Equal("Generali", body.Insurer);
    }

    [Fact]
    public async Task DeleteDocument_Returns204()
    {
        var (client, carId) = await SetupAsync("d5@example.com");
        var created = (await (await client.PostAsJsonAsync(
            $"/api/cars/{carId}/documents", DocInput())).Content
            .ReadFromJsonAsync<DocumentDto>())!;

        var resp = await client.DeleteAsync($"/api/cars/{carId}/documents/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, resp.StatusCode);
    }

    [Fact]
    public async Task GetUploadUrl_Returns200WithUrl()
    {
        var (client, carId) = await SetupAsync("d6@example.com");
        var created = (await (await client.PostAsJsonAsync(
            $"/api/cars/{carId}/documents", DocInput())).Content
            .ReadFromJsonAsync<DocumentDto>())!;

        var resp = await client.PostAsync(
            $"/api/cars/{carId}/documents/{created.Id}/photos/upload-url", null);
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<UploadUrlResponse>();
        Assert.NotNull(body);
        Assert.False(string.IsNullOrEmpty(body.UploadUrl));
        Assert.NotEqual(Guid.Empty, body.PictureId);
    }

    [Fact]
    public async Task GetUploadUrl_ThenGetDocument_HasPhotoUrl()
    {
        var (client, carId) = await SetupAsync("d7@example.com");
        var created = (await (await client.PostAsJsonAsync(
            $"/api/cars/{carId}/documents", DocInput())).Content
            .ReadFromJsonAsync<DocumentDto>())!;

        await client.PostAsync(
            $"/api/cars/{carId}/documents/{created.Id}/photos/upload-url", null);

        var resp = await client.GetAsync($"/api/cars/{carId}/documents/{created.Id}");
        var body = await resp.Content.ReadFromJsonAsync<DocumentDto>();
        Assert.Single(body!.PhotoUrls);
    }

    [Fact]
    public async Task DeletePhoto_Returns204()
    {
        var (client, carId) = await SetupAsync("d8@example.com");
        var created = (await (await client.PostAsJsonAsync(
            $"/api/cars/{carId}/documents", DocInput())).Content
            .ReadFromJsonAsync<DocumentDto>())!;

        var urlResp = await (await client.PostAsync(
            $"/api/cars/{carId}/documents/{created.Id}/photos/upload-url", null)).Content
            .ReadFromJsonAsync<UploadUrlResponse>();
        var pictureId = urlResp!.PictureId;

        var del = await client.DeleteAsync(
            $"/api/cars/{carId}/documents/{created.Id}/photos/{pictureId}");
        Assert.Equal(HttpStatusCode.NoContent, del.StatusCode);
    }
}

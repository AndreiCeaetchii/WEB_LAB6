using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using CarTrack.Application.Dtos;
using CarTrack.Application.Dtos.Auth;
using CarTrack.Application.Dtos.Cars;

namespace CarTrack.Tests.API.Cars;

public class CarsCrudTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private async Task<(HttpClient Client, TokenResponse Tokens)> RegisterUser(string email)
    {
        var client = factory.CreateClient();
        var resp = await client.PostAsJsonAsync("/api/auth/register",
            new { email, password = "Password1!" });
        var tokens = (await resp.Content.ReadFromJsonAsync<TokenResponse>())!;
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        return (client, tokens);
    }

    private static object DefaultCarPayload() =>
        new { make = "BMW", model = "X5", year = 2022, accentId = "blue" };

    [Fact]
    public async Task ListCars_EmptyForNewUser_Returns200WithEmptyPage()
    {
        var (client, _) = await RegisterUser("list@example.com");

        var response = await client.GetAsync("/api/cars");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<PaginatedResult<CarDto>>();
        Assert.NotNull(body);
        Assert.Equal(0, body.Total);
        Assert.Empty(body.Items);
    }

    [Fact]
    public async Task CreateCar_WithValidData_Returns201WithCar()
    {
        var (client, _) = await RegisterUser("create@example.com");

        var response = await client.PostAsJsonAsync("/api/cars", DefaultCarPayload());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<CarDto>();
        Assert.NotNull(body);
        Assert.Equal("BMW", body.Make);
        Assert.Equal("X5", body.Model);
        Assert.Equal(2022, body.Year);
        Assert.Empty(body.PhotoUrls);
    }

    [Fact]
    public async Task GetCar_ByOwner_Returns200()
    {
        var (client, _) = await RegisterUser("getcar@example.com");
        var createResp = await client.PostAsJsonAsync("/api/cars", DefaultCarPayload());
        var car = (await createResp.Content.ReadFromJsonAsync<CarDto>())!;

        var response = await client.GetAsync($"/api/cars/{car.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<CarDto>();
        Assert.Equal(car.Id, body!.Id);
    }

    [Fact]
    public async Task GetCar_ByNonMember_Returns403()
    {
        var (client1, _) = await RegisterUser("owner2@example.com");
        var (client2, _) = await RegisterUser("stranger@example.com");
        var createResp = await client1.PostAsJsonAsync("/api/cars", DefaultCarPayload());
        var car = (await createResp.Content.ReadFromJsonAsync<CarDto>())!;

        var response = await client2.GetAsync($"/api/cars/{car.Id}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task UpdateCar_ByOwner_Returns200WithUpdatedFields()
    {
        var (client, _) = await RegisterUser("update@example.com");
        var createResp = await client.PostAsJsonAsync("/api/cars", DefaultCarPayload());
        var car = (await createResp.Content.ReadFromJsonAsync<CarDto>())!;

        var response = await client.PutAsJsonAsync($"/api/cars/{car.Id}",
            new { make = "Audi", model = "Q7", year = 2023, accentId = "red" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<CarDto>();
        Assert.Equal("Audi", body!.Make);
        Assert.Equal("Q7", body.Model);
        Assert.Equal(2023, body.Year);
    }

    [Fact]
    public async Task DeleteCar_ByOwner_Returns204()
    {
        var (client, _) = await RegisterUser("delete@example.com");
        var createResp = await client.PostAsJsonAsync("/api/cars", DefaultCarPayload());
        var car = (await createResp.Content.ReadFromJsonAsync<CarDto>())!;

        var response = await client.DeleteAsync($"/api/cars/{car.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task DeleteCar_ThenGetCar_Returns404()
    {
        var (client, _) = await RegisterUser("delete2@example.com");
        var createResp = await client.PostAsJsonAsync("/api/cars", DefaultCarPayload());
        var car = (await createResp.Content.ReadFromJsonAsync<CarDto>())!;
        await client.DeleteAsync($"/api/cars/{car.Id}");

        var response = await client.GetAsync($"/api/cars/{car.Id}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task PatchCar_SetFavoriteTrue_Returns200()
    {
        var (client, _) = await RegisterUser("patch@example.com");
        var createResp = await client.PostAsJsonAsync("/api/cars", DefaultCarPayload());
        var car = (await createResp.Content.ReadFromJsonAsync<CarDto>())!;

        var response = await client.PatchAsJsonAsync($"/api/cars/{car.Id}",
            new { favorite = true });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<CarDto>();
        Assert.True(body!.Favorite);
    }

    [Fact]
    public async Task GetUploadUrl_ByOwner_Returns200WithUrl()
    {
        var (client, _) = await RegisterUser("upload@example.com");
        var createResp = await client.PostAsJsonAsync("/api/cars", DefaultCarPayload());
        var car = (await createResp.Content.ReadFromJsonAsync<CarDto>())!;

        var response = await client.PostAsync($"/api/cars/{car.Id}/photos/upload-url", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<UploadUrlResponse>();
        Assert.NotNull(body);
        Assert.False(string.IsNullOrEmpty(body.UploadUrl));
        Assert.NotEqual(Guid.Empty, body.PictureId);
    }

    [Fact]
    public async Task PatchCar_ConfirmPictureId_AddsPhotoUrl()
    {
        var (client, _) = await RegisterUser("photo@example.com");
        var createResp = await client.PostAsJsonAsync("/api/cars", DefaultCarPayload());
        var car = (await createResp.Content.ReadFromJsonAsync<CarDto>())!;

        var uploadResp = await client.PostAsync($"/api/cars/{car.Id}/photos/upload-url", null);
        var upload = (await uploadResp.Content.ReadFromJsonAsync<UploadUrlResponse>())!;

        var response = await client.PatchAsJsonAsync($"/api/cars/{car.Id}",
            new { pictureId = upload.PictureId });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<CarDto>();
        Assert.Single(body!.PhotoUrls);
    }

    [Fact]
    public async Task DeletePhoto_ByOwner_Returns204()
    {
        var (client, _) = await RegisterUser("dphoto@example.com");
        var createResp = await client.PostAsJsonAsync("/api/cars", DefaultCarPayload());
        var car = (await createResp.Content.ReadFromJsonAsync<CarDto>())!;

        var uploadResp = await client.PostAsync($"/api/cars/{car.Id}/photos/upload-url", null);
        var upload = (await uploadResp.Content.ReadFromJsonAsync<UploadUrlResponse>())!;
        await client.PatchAsJsonAsync($"/api/cars/{car.Id}", new { pictureId = upload.PictureId });

        var response = await client.DeleteAsync($"/api/cars/{car.Id}/photos/{upload.PictureId}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task ListCars_AfterCreate_ReturnsOneCar()
    {
        var (client, _) = await RegisterUser("listafter@example.com");
        await client.PostAsJsonAsync("/api/cars", DefaultCarPayload());

        var response = await client.GetAsync("/api/cars");
        var body = await response.Content.ReadFromJsonAsync<PaginatedResult<CarDto>>();

        Assert.Equal(1, body!.Total);
        Assert.Single(body.Items);
    }
}

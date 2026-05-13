using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using CarTrack.Application.Dtos;
using CarTrack.Application.Dtos.Auth;
using CarTrack.Application.Dtos.Cars;
using CarTrack.Application.Dtos.Expenses;

namespace CarTrack.Tests.API.Expenses;

public class ExpensesCrudTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
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
            make = "Toyota", model = "Corolla", year = 2020,
            vin = "", licensePlate = "", accentId = "blue",
            isElectric = false, favorite = false
        });
        var car = (await carResp.Content.ReadFromJsonAsync<CarDto>())!;
        return (client, car.Id);
    }

    private static object FuelInput() => new
    {
        category = "fuel", date = "2024-01-15",
        cost = 60.50m, note = (string?)null,
        fuelUnit = "L", fuelQuantity = 40.0m, fuelUnitPrice = 1.51m, odometerKm = 50000
    };

    [Fact]
    public async Task ListExpenses_Empty_Returns200()
    {
        var (client, carId) = await SetupAsync("e1@example.com");
        var resp = await client.GetAsync($"/api/cars/{carId}/expenses");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<PaginatedResult<ExpenseDto>>();
        Assert.NotNull(body);
        Assert.Equal(0, body.Total);
    }

    [Fact]
    public async Task CreateExpense_Fuel_Returns201()
    {
        var (client, carId) = await SetupAsync("e2@example.com");
        var resp = await client.PostAsJsonAsync($"/api/cars/{carId}/expenses", FuelInput());
        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<ExpenseDto>();
        Assert.NotNull(body);
        Assert.Equal("fuel", body.Category);
        Assert.Equal(60.50m, body.Cost);
        Assert.Equal("L", body.FuelUnit);
    }

    [Fact]
    public async Task GetExpense_ByOwner_Returns200()
    {
        var (client, carId) = await SetupAsync("e3@example.com");
        var created = (await (await client.PostAsJsonAsync(
            $"/api/cars/{carId}/expenses", FuelInput())).Content
            .ReadFromJsonAsync<ExpenseDto>())!;

        var resp = await client.GetAsync($"/api/cars/{carId}/expenses/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<ExpenseDto>();
        Assert.Equal(created.Id, body!.Id);
    }

    [Fact]
    public async Task GetExpense_WrongCar_Returns404()
    {
        var (client, carId) = await SetupAsync("e4@example.com");
        var (client2, carId2) = await SetupAsync("e4b@example.com");
        var created = (await (await client.PostAsJsonAsync(
            $"/api/cars/{carId}/expenses", FuelInput())).Content
            .ReadFromJsonAsync<ExpenseDto>())!;

        // Access expense via a different car — should 404
        var resp = await client2.GetAsync($"/api/cars/{carId2}/expenses/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    [Fact]
    public async Task GetExpense_NonMember_Returns403()
    {
        var (client, carId) = await SetupAsync("e5@example.com");
        var created = (await (await client.PostAsJsonAsync(
            $"/api/cars/{carId}/expenses", FuelInput())).Content
            .ReadFromJsonAsync<ExpenseDto>())!;

        var client2 = factory.CreateClient();
        var reg2 = await client2.PostAsJsonAsync("/api/auth/register",
            new { email = "e5b@example.com", password = "Password1!" });
        var tokens2 = (await reg2.Content.ReadFromJsonAsync<TokenResponse>())!;
        client2.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", tokens2.AccessToken);

        var resp = await client2.GetAsync($"/api/cars/{carId}/expenses/{created.Id}");
        Assert.Equal(HttpStatusCode.Forbidden, resp.StatusCode);
    }

    [Fact]
    public async Task UpdateExpense_Returns200()
    {
        var (client, carId) = await SetupAsync("e6@example.com");
        var created = (await (await client.PostAsJsonAsync(
            $"/api/cars/{carId}/expenses", FuelInput())).Content
            .ReadFromJsonAsync<ExpenseDto>())!;

        var resp = await client.PutAsJsonAsync($"/api/cars/{carId}/expenses/{created.Id}", new
        {
            category = "fuel", date = "2024-02-01",
            cost = 80.00m, note = (string?)null,
            fuelUnit = "L", fuelQuantity = 50.0m, fuelUnitPrice = 1.60m, odometerKm = 51000
        });
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<ExpenseDto>();
        Assert.Equal(created.Id, body!.Id);
        Assert.Equal(80.00m, body.Cost);
    }

    [Fact]
    public async Task DeleteExpense_Returns204()
    {
        var (client, carId) = await SetupAsync("e7@example.com");
        var created = (await (await client.PostAsJsonAsync(
            $"/api/cars/{carId}/expenses", FuelInput())).Content
            .ReadFromJsonAsync<ExpenseDto>())!;

        var del = await client.DeleteAsync($"/api/cars/{carId}/expenses/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, del.StatusCode);
    }

    [Fact]
    public async Task DeleteExpense_ThenGet_Returns404()
    {
        var (client, carId) = await SetupAsync("e8@example.com");
        var created = (await (await client.PostAsJsonAsync(
            $"/api/cars/{carId}/expenses", FuelInput())).Content
            .ReadFromJsonAsync<ExpenseDto>())!;

        await client.DeleteAsync($"/api/cars/{carId}/expenses/{created.Id}");
        var resp = await client.GetAsync($"/api/cars/{carId}/expenses/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    [Fact]
    public async Task ListExpenses_FilterByCategory_Returns200()
    {
        var (client, carId) = await SetupAsync("e9@example.com");
        await client.PostAsJsonAsync($"/api/cars/{carId}/expenses", FuelInput());
        await client.PostAsJsonAsync($"/api/cars/{carId}/expenses", new
        {
            category = "repair", date = "2024-01-20",
            cost = 200.00m, repairDescription = "Oil change", mechanic = (string?)null
        });

        var resp = await client.GetAsync($"/api/cars/{carId}/expenses?category=fuel");
        var body = await resp.Content.ReadFromJsonAsync<PaginatedResult<ExpenseDto>>();
        Assert.Equal(1, body!.Total);
        Assert.All(body.Items, e => Assert.Equal("fuel", e.Category));
    }
}

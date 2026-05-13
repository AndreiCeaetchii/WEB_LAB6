using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using CarTrack.Application.Dtos.Auth;
using CarTrack.Application.Dtos.Import;

namespace CarTrack.Tests.API.Import;

public class ImportTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private async Task<HttpClient> RegisterAndAuth(string email)
    {
        var client = factory.CreateClient();
        var resp = await client.PostAsJsonAsync("/api/auth/register",
            new { email, password = "Password1!" });
        var tokens = (await resp.Content.ReadFromJsonAsync<TokenResponse>())!;
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        return client;
    }

    private static MultipartFormDataContent BuildBackupForm(object backup)
    {
        var json = JsonSerializer.Serialize(backup);
        var content = new MultipartFormDataContent();
        var fileContent = new StringContent(json, Encoding.UTF8, "application/json");
        content.Add(fileContent, "file", "backup.json");
        return content;
    }

    [Fact]
    public async Task Import_ValidBackupWithCarAndExpense_Returns200WithCounts()
    {
        var client = await RegisterAndAuth("import_basic@example.com");
        var carOldId = Guid.NewGuid().ToString();

        var backup = new
        {
            version = 1,
            exportedAt = DateTime.UtcNow.ToString("O"),
            cars = new[]
            {
                new { id = carOldId, make = "BMW", model = "M3", year = 2021,
                      vin = "WBS12345", licensePlate = "AB-123-CD", accentId = "blue",
                      isElectric = false, favorite = false, createdAt = 0L, updatedAt = 0L,
                      photo = (string?)null }
            },
            expenses = new[]
            {
                new { id = Guid.NewGuid().ToString(), carId = carOldId, category = "fuel",
                      date = "2024-06-01", cost = 60.0m, note = (string?)null,
                      createdAt = 0L, updatedAt = 0L,
                      unit = "L", quantity = 48.0m, unitPrice = 1.25m,
                      odometerKm = (int?)null, description = (string?)null, mechanic = (string?)null,
                      partName = (string?)null, partsQuantity = (int?)null, nextDueDate = (string?)null }
            },
            documents = Array.Empty<object>()
        };

        var resp = await client.PostAsync("/api/import", BuildBackupForm(backup));

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var result = await resp.Content.ReadFromJsonAsync<ImportResultDto>();
        Assert.NotNull(result);
        Assert.Equal(1, result.CarsImported);
        Assert.Equal(1, result.ExpensesImported);
        Assert.Equal(0, result.DocumentsImported);
    }

    [Fact]
    public async Task Import_BackupWithDocument_Returns200WithDocumentCount()
    {
        var client = await RegisterAndAuth("import_doc@example.com");
        var carOldId = Guid.NewGuid().ToString();

        var backup = new
        {
            version = 1,
            exportedAt = DateTime.UtcNow.ToString("O"),
            cars = new[]
            {
                new { id = carOldId, make = "Audi", model = "A4", year = 2019,
                      vin = "", licensePlate = "", accentId = "red",
                      isElectric = false, favorite = false, createdAt = 0L, updatedAt = 0L,
                      photo = (string?)null }
            },
            expenses = Array.Empty<object>(),
            documents = new[]
            {
                new { id = Guid.NewGuid().ToString(), carId = carOldId, kind = "rca",
                      insurer = "Allianz", policyNumber = "RCA-2024-001",
                      startDate = "2024-01-01", endDate = "2025-01-01",
                      cost = 250.0m, note = (string?)null,
                      createdAt = 0L, updatedAt = 0L,
                      photos = new List<string>() }
            }
        };

        var resp = await client.PostAsync("/api/import", BuildBackupForm(backup));

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var result = await resp.Content.ReadFromJsonAsync<ImportResultDto>();
        Assert.NotNull(result);
        Assert.Equal(1, result.CarsImported);
        Assert.Equal(0, result.ExpensesImported);
        Assert.Equal(1, result.DocumentsImported);
    }

    [Fact]
    public async Task Import_NoFile_Returns400()
    {
        var client = await RegisterAndAuth("import_nofile@example.com");
        var content = new MultipartFormDataContent();

        var resp = await client.PostAsync("/api/import", content);

        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task Import_InvalidJson_Returns400()
    {
        var client = await RegisterAndAuth("import_invalid@example.com");
        var content = new MultipartFormDataContent();
        content.Add(new StringContent("not valid json", Encoding.UTF8, "application/json"), "file", "bad.json");

        var resp = await client.PostAsync("/api/import", content);

        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task Import_UnauthenticatedRequest_Returns401()
    {
        var client = factory.CreateClient();
        var backup = new { version = 1, exportedAt = DateTime.UtcNow.ToString("O"), cars = Array.Empty<object>(), expenses = Array.Empty<object>(), documents = Array.Empty<object>() };

        var resp = await client.PostAsync("/api/import", BuildBackupForm(backup));

        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }
}

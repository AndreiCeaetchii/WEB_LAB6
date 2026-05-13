using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using CarTrack.Application.Dtos.Admin;

namespace CarTrack.Tests.API.Admin;

public class AdminCrudTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private async Task<HttpClient> AdminClientAsync()
    {
        var client = factory.CreateClient();
        var resp = await client.GetAsync("/token?role=admin");
        var body = await resp.Content.ReadFromJsonAsync<Dictionary<string, string>>();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", body!["accessToken"]);
        return client;
    }

    private async Task<HttpClient> UserClientAsync(string email)
    {
        var client = factory.CreateClient();
        await client.PostAsJsonAsync("/api/auth/register",
            new { email, password = "Password1!" });
        var resp = await client.GetAsync("/token?role=user");
        var body = await resp.Content.ReadFromJsonAsync<Dictionary<string, string>>();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", body!["accessToken"]);
        return client;
    }

    [Fact]
    public async Task GetExpenseCategories_AsAdmin_Returns200WithSeeded()
    {
        var client = await AdminClientAsync();
        var resp = await client.GetAsync("/api/admin/expense-categories");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<List<ExpenseCategoryDto>>();
        Assert.NotNull(body);
        Assert.Contains(body, c => c.Slug == "fuel");
        Assert.Contains(body, c => c.Slug == "repair");
    }

    [Fact]
    public async Task GetExpenseCategories_AsUser_Returns403()
    {
        var client = await UserClientAsync("a1@example.com");
        var resp = await client.GetAsync("/api/admin/expense-categories");
        Assert.Equal(HttpStatusCode.Forbidden, resp.StatusCode);
    }

    [Fact]
    public async Task CreateExpenseCategory_Returns201()
    {
        var client = await AdminClientAsync();
        var resp = await client.PostAsJsonAsync("/api/admin/expense-categories",
            new { slug = "tuning", label = "Tuning", sortOrder = 10 });
        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<ExpenseCategoryDto>();
        Assert.Equal("tuning", body!.Slug);
        Assert.False(body.IsSystem);
    }

    [Fact]
    public async Task UpdateExpenseCategory_Returns200()
    {
        var client = await AdminClientAsync();
        await client.PostAsJsonAsync("/api/admin/expense-categories",
            new { slug = "washing", label = "Washing", sortOrder = 11 });

        var resp = await client.PutAsJsonAsync("/api/admin/expense-categories/washing",
            new { label = "Car Wash", sortOrder = 11 });
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<ExpenseCategoryDto>();
        Assert.Equal("Car Wash", body!.Label);
    }

    [Fact]
    public async Task DeleteExpenseCategory_System_Returns400()
    {
        var client = await AdminClientAsync();
        var resp = await client.DeleteAsync("/api/admin/expense-categories/fuel");
        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task DeleteExpenseCategory_Custom_Returns204()
    {
        var client = await AdminClientAsync();
        await client.PostAsJsonAsync("/api/admin/expense-categories",
            new { slug = "parking", label = "Parking", sortOrder = 12 });
        var resp = await client.DeleteAsync("/api/admin/expense-categories/parking");
        Assert.Equal(HttpStatusCode.NoContent, resp.StatusCode);
    }

    [Fact]
    public async Task GetDocumentKinds_AsAdmin_Returns200WithSeeded()
    {
        var client = await AdminClientAsync();
        var resp = await client.GetAsync("/api/admin/document-kinds");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<List<DocumentKindDto>>();
        Assert.Contains(body!, k => k.Slug == "rca");
    }

    [Fact]
    public async Task CreateDocumentKind_Returns201()
    {
        var client = await AdminClientAsync();
        var resp = await client.PostAsJsonAsync("/api/admin/document-kinds",
            new { slug = "itp", label = "ITP", sortOrder = 5 });
        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<DocumentKindDto>();
        Assert.Equal("itp", body!.Slug);
        Assert.False(body.IsSystem);
    }

    [Fact]
    public async Task DeleteDocumentKind_System_Returns400()
    {
        var client = await AdminClientAsync();
        var resp = await client.DeleteAsync("/api/admin/document-kinds/rca");
        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task DeleteDocumentKind_Custom_Returns204()
    {
        var client = await AdminClientAsync();
        await client.PostAsJsonAsync("/api/admin/document-kinds",
            new { slug = "leasing", label = "Leasing Contract", sortOrder = 6 });
        var resp = await client.DeleteAsync("/api/admin/document-kinds/leasing");
        Assert.Equal(HttpStatusCode.NoContent, resp.StatusCode);
    }
}

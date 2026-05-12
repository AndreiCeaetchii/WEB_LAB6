using CarTrack.Infrastructure;
using CarTrack.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

// Apply pending migrations on startup (skip for in-memory/test provider)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (db.Database.IsRelational())
        db.Database.Migrate();
}

// Swagger enabled in all environments (lab requirement)
app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();
app.Run();

// Required for WebApplicationFactory in tests
public partial class Program { }

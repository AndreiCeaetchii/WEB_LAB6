using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace CarTrack.Infrastructure.Persistence;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(
                "Host=localhost;Database=cartrack_dev;Username=cartrack;Password=cartrack",
                npgsql => npgsql.MigrationsAssembly("CarTrack.Infrastructure"))
            .UseSnakeCaseNamingConvention()
            .Options;
        return new AppDbContext(options);
    }
}

using CarTrack.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CarTrack.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("ConnectionStrings:Default is required");

        services.AddDbContext<AppDbContext>(options =>
            options
                .UseNpgsql(connectionString,
                    npgsql => npgsql.MigrationsAssembly("CarTrack.Infrastructure"))
                .UseSnakeCaseNamingConvention());

        return services;
    }
}

using CarTrack.Application.Interfaces;
using CarTrack.Application.Services;
using CarTrack.Domain.Interfaces;
using CarTrack.Infrastructure.Auth;
using CarTrack.Infrastructure.Persistence;
using CarTrack.Infrastructure.Persistence.Repositories;
using CarTrack.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

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

        var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>()
            ?? throw new InvalidOperationException("Jwt config section is required");
        services.AddSingleton(jwtSettings);

        services.AddSingleton<ITokenService, JwtTokenService>();
        services.AddScoped<IAuthRepository, AuthRepository>();
        services.AddScoped<IAuthService, AuthService>();

        var minioSettings = configuration.GetSection("Minio").Get<MinioSettings>() ?? new MinioSettings();
        services.AddSingleton(minioSettings);
        services.AddSingleton<IStorageService, MinioStorageService>();

        return services;
    }
}

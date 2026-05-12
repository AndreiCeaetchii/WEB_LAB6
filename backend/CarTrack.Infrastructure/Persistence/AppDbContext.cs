using CarTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CarTrack.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Car> Cars => Set<Car>();
    public DbSet<CarUser> CarUsers => Set<CarUser>();
    public DbSet<Picture> Pictures => Set<Picture>();
    public DbSet<CarPicture> CarPictures => Set<CarPicture>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<ExpenseCategory> ExpenseCategories => Set<ExpenseCategory>();
    public DbSet<VehicleDocument> VehicleDocuments => Set<VehicleDocument>();
    public DbSet<CarDocument> CarDocuments => Set<CarDocument>();
    public DbSet<DocumentPicture> DocumentPictures => Set<DocumentPicture>();
    public DbSet<DocumentKind> DocumentKinds => Set<DocumentKind>();
    public DbSet<CarShare> CarShares => Set<CarShare>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Composite primary keys
        modelBuilder.Entity<CarUser>().HasKey(x => new { x.CarId, x.UserId });
        modelBuilder.Entity<CarPicture>().HasKey(x => new { x.CarId, x.PictureId });
        modelBuilder.Entity<CarDocument>().HasKey(x => new { x.CarId, x.DocumentId });
        modelBuilder.Entity<DocumentPicture>().HasKey(x => new { x.DocumentId, x.PictureId });

        // Text primary keys for lookup tables
        modelBuilder.Entity<ExpenseCategory>().HasKey(x => x.Slug);
        modelBuilder.Entity<DocumentKind>().HasKey(x => x.Slug);

        // Expense TPH — Category property is the discriminator column
        modelBuilder.Entity<Expense>()
            .HasDiscriminator(e => e.Category)
            .HasValue<FuelExpense>("fuel")
            .HasValue<RepairExpense>("repair")
            .HasValue<PartsExpense>("parts")
            .HasValue<InspectionExpense>("inspection")
            .HasValue<OtherExpense>("other");

        // VehicleDocument → DocumentKind FK (text PK)
        modelBuilder.Entity<VehicleDocument>()
            .HasOne(d => d.KindNavigation)
            .WithMany()
            .HasForeignKey(d => d.Kind)
            .HasPrincipalKey(k => k.Slug);

        // CarShare → User (nullable redeemed_by)
        modelBuilder.Entity<CarShare>()
            .HasOne(s => s.RedeemedByUser)
            .WithMany()
            .HasForeignKey(s => s.RedeemedBy)
            .IsRequired(false);

        // Unique indexes
        modelBuilder.Entity<RefreshToken>().HasIndex(t => t.TokenHash).IsUnique();
        modelBuilder.Entity<CarShare>().HasIndex(s => s.Token).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

        // Seed expense categories
        modelBuilder.Entity<ExpenseCategory>().HasData(
            new ExpenseCategory { Slug = "fuel",       Label = "Fuel",       IsSystem = true, SortOrder = 0 },
            new ExpenseCategory { Slug = "repair",     Label = "Repair",     IsSystem = true, SortOrder = 1 },
            new ExpenseCategory { Slug = "parts",      Label = "Parts",      IsSystem = true, SortOrder = 2 },
            new ExpenseCategory { Slug = "inspection", Label = "Inspection", IsSystem = true, SortOrder = 3 },
            new ExpenseCategory { Slug = "other",      Label = "Other",      IsSystem = true, SortOrder = 4 }
        );

        // Seed document kinds
        modelBuilder.Entity<DocumentKind>().HasData(
            new DocumentKind { Slug = "rca",          Label = "RCA Insurance", IsSystem = true, SortOrder = 0 },
            new DocumentKind { Slug = "cartea-verde", Label = "Cartea Verde",  IsSystem = true, SortOrder = 1 }
        );
    }
}

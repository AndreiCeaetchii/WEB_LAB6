using CarTrack.Application.Dtos.Import;
using CarTrack.Application.Interfaces;
using CarTrack.Domain.Entities;
using CarTrack.Domain.Interfaces;

namespace CarTrack.Application.Services;

public class ImportService(
    ICarRepository carRepository,
    IExpenseRepository expenseRepository,
    IDocumentRepository documentRepository,
    IStorageService storageService) : IImportService
{
    public async Task<ImportResultDto> ImportAsync(ImportBackupDto backup, Guid userId, CancellationToken ct = default)
    {
        var carIdMap = new Dictionary<string, Guid>();

        foreach (var c in backup.Cars ?? [])
        {
            var car = new Car
            {
                Id = Guid.NewGuid(),
                Make = c.Make,
                Model = c.Model,
                Year = c.Year,
                Vin = c.Vin ?? string.Empty,
                LicensePlate = c.LicensePlate ?? string.Empty,
                AccentId = c.AccentId,
                IsElectric = c.IsElectric,
                Favorite = c.Favorite,
                CreatedAt = c.CreatedAt > 0
                    ? DateTimeOffset.FromUnixTimeMilliseconds(c.CreatedAt).UtcDateTime
                    : DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await carRepository.AddCarAsync(car, ct);
            await carRepository.AddCarUserAsync(new CarUser
            {
                CarId = car.Id, UserId = userId, Role = "owner", CreatedAt = DateTime.UtcNow
            }, ct);
            carIdMap[c.Id] = car.Id;

            if (!string.IsNullOrEmpty(c.Photo))
            {
                var pictureId = Guid.NewGuid();
                var objectKey = storageService.BuildObjectKey("cars", userId, car.Id, $"{pictureId}.webp");
                var bytes = DecodeDataUrl(c.Photo);
                using var stream = new MemoryStream(bytes);
                await storageService.UploadAsync(objectKey, stream, "image/webp", ct);
                await carRepository.AddPictureAsync(new Picture
                {
                    Id = pictureId, ObjectKey = objectKey, MimeType = "image/webp", CreatedAt = DateTime.UtcNow
                }, ct);
                await carRepository.AddCarPictureAsync(new CarPicture
                {
                    CarId = car.Id, PictureId = pictureId, SortOrder = 0
                }, ct);
            }
        }
        await carRepository.SaveChangesAsync(ct);

        var expensesImported = 0;
        foreach (var e in backup.Expenses ?? [])
        {
            if (!carIdMap.TryGetValue(e.CarId, out var newCarId)) continue;
            var expense = BuildExpense(e, newCarId);
            await expenseRepository.AddExpenseAsync(expense, ct);
            expensesImported++;
        }
        if (expensesImported > 0) await expenseRepository.SaveChangesAsync(ct);

        var documentsImported = 0;
        foreach (var d in backup.Documents ?? [])
        {
            if (!carIdMap.TryGetValue(d.CarId, out var newCarId)) continue;
            var doc = new VehicleDocument
            {
                Id = Guid.NewGuid(),
                Kind = d.Kind,
                Insurer = d.Insurer,
                PolicyNumber = d.PolicyNumber,
                StartDate = DateOnly.Parse(d.StartDate),
                EndDate = DateOnly.Parse(d.EndDate),
                Cost = d.Cost,
                Note = d.Note,
                CreatedAt = d.CreatedAt > 0
                    ? DateTimeOffset.FromUnixTimeMilliseconds(d.CreatedAt).UtcDateTime
                    : DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await documentRepository.AddDocumentAsync(doc, ct);
            await documentRepository.AddCarDocumentAsync(new CarDocument
            {
                CarId = newCarId, DocumentId = doc.Id, CreatedAt = DateTime.UtcNow
            }, ct);

            var sortOrder = 0;
            foreach (var photo in d.Photos ?? [])
            {
                var pictureId = Guid.NewGuid();
                var objectKey = storageService.BuildObjectKey("documents", userId, doc.Id, $"{pictureId}.webp");
                var bytes = DecodeDataUrl(photo);
                using var stream = new MemoryStream(bytes);
                await storageService.UploadAsync(objectKey, stream, "image/webp", ct);
                await documentRepository.AddPictureAsync(new Picture
                {
                    Id = pictureId, ObjectKey = objectKey, MimeType = "image/webp", CreatedAt = DateTime.UtcNow
                }, ct);
                await documentRepository.AddDocumentPictureAsync(new DocumentPicture
                {
                    DocumentId = doc.Id, PictureId = pictureId, SortOrder = sortOrder++
                }, ct);
            }
            documentsImported++;
        }
        if (documentsImported > 0) await documentRepository.SaveChangesAsync(ct);

        return new ImportResultDto(carIdMap.Count, expensesImported, documentsImported);
    }

    private static byte[] DecodeDataUrl(string dataUrl)
    {
        var comma = dataUrl.IndexOf(',');
        var base64 = comma >= 0 ? dataUrl[(comma + 1)..] : dataUrl;
        return Convert.FromBase64String(base64);
    }

    private static Expense BuildExpense(ImportExpenseDto e, Guid carId)
    {
        var createdAt = e.CreatedAt > 0
            ? DateTimeOffset.FromUnixTimeMilliseconds(e.CreatedAt).UtcDateTime
            : DateTime.UtcNow;
        var date = DateOnly.Parse(e.Date);

        Expense expense = e.Category switch
        {
            "fuel" => new FuelExpense
            {
                FuelUnit = e.Unit ?? "L",
                FuelQuantity = e.Quantity ?? 0,
                FuelUnitPrice = e.UnitPrice ?? 0,
                OdometerKm = e.OdometerKm
            },
            "repair" => new RepairExpense
            {
                RepairDescription = e.Description ?? string.Empty,
                Mechanic = e.Mechanic
            },
            "parts" => new PartsExpense
            {
                PartName = e.PartName ?? string.Empty,
                PartsQuantity = e.PartsQuantity ?? 1
            },
            "inspection" => new InspectionExpense
            {
                NextDueDate = string.IsNullOrEmpty(e.NextDueDate) ? null : DateOnly.Parse(e.NextDueDate)
            },
            _ => new OtherExpense { OtherDescription = e.Description }
        };

        expense.Id = Guid.NewGuid();
        expense.CarId = carId;
        expense.Category = e.Category;
        expense.Date = date;
        expense.Cost = e.Cost;
        expense.Note = e.Note;
        expense.CreatedAt = createdAt;
        expense.UpdatedAt = DateTime.UtcNow;
        return expense;
    }
}

using CarTrack.Application.Dtos;
using CarTrack.Application.Interfaces;
using CarTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CarTrack.Infrastructure.Persistence.Repositories;

public class DocumentRepository(AppDbContext context) : IDocumentRepository
{
    public async Task<PaginatedResult<VehicleDocument>> GetDocumentsAsync(
        Guid carId, string? kind, int page, int pageSize, CancellationToken ct = default)
    {
        var docIds = await context.CarDocuments
            .Where(cd => cd.CarId == carId)
            .Select(cd => cd.DocumentId)
            .ToListAsync(ct);

        var query = context.VehicleDocuments.Where(d => docIds.Contains(d.Id));
        if (kind is not null) query = query.Where(d => d.Kind == kind);

        var total = await query.CountAsync(ct);
        var items = await query
            .Include(d => d.DocumentPictures).ThenInclude(dp => dp.Picture)
            .OrderBy(d => d.StartDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PaginatedResult<VehicleDocument>(items, total, page, pageSize);
    }

    public Task<VehicleDocument?> GetDocumentByCarAsync(
        Guid documentId, Guid carId, CancellationToken ct = default)
        => context.VehicleDocuments
            .Include(d => d.DocumentPictures).ThenInclude(dp => dp.Picture)
            .Where(d => d.Id == documentId &&
                        d.CarDocuments.Any(cd => cd.CarId == carId))
            .FirstOrDefaultAsync(ct);

    public Task AddDocumentAsync(VehicleDocument document, CancellationToken ct = default)
    {
        context.VehicleDocuments.Add(document);
        return Task.CompletedTask;
    }

    public Task AddCarDocumentAsync(CarDocument carDocument, CancellationToken ct = default)
    {
        context.CarDocuments.Add(carDocument);
        return Task.CompletedTask;
    }

    public Task RemoveDocumentAsync(VehicleDocument document)
    {
        context.VehicleDocuments.Remove(document);
        return Task.CompletedTask;
    }

    public Task AddPictureAsync(Picture picture, CancellationToken ct = default)
    {
        context.Pictures.Add(picture);
        return Task.CompletedTask;
    }

    public Task AddDocumentPictureAsync(DocumentPicture documentPicture, CancellationToken ct = default)
    {
        context.DocumentPictures.Add(documentPicture);
        return Task.CompletedTask;
    }

    public Task<DocumentPicture?> GetDocumentPictureAsync(
        Guid documentId, Guid pictureId, CancellationToken ct = default)
        => context.DocumentPictures
            .Include(dp => dp.Picture)
            .FirstOrDefaultAsync(dp => dp.DocumentId == documentId && dp.PictureId == pictureId, ct);

    public Task RemoveDocumentPictureAsync(DocumentPicture documentPicture)
    {
        context.DocumentPictures.Remove(documentPicture);
        return Task.CompletedTask;
    }

    public Task RemovePictureAsync(Picture picture)
    {
        context.Pictures.Remove(picture);
        return Task.CompletedTask;
    }

    public Task<int> CountDocumentPicturesAsync(Guid documentId, CancellationToken ct = default)
        => context.DocumentPictures.CountAsync(dp => dp.DocumentId == documentId, ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => context.SaveChangesAsync(ct);
}

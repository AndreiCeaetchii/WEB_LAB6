using CarTrack.Application.Dtos;
using CarTrack.Domain.Entities;

namespace CarTrack.Application.Interfaces;

public interface IDocumentRepository
{
    Task<PaginatedResult<VehicleDocument>> GetDocumentsAsync(
        Guid carId, string? kind, int page, int pageSize, CancellationToken ct = default);
    Task<VehicleDocument?> GetDocumentByCarAsync(Guid documentId, Guid carId, CancellationToken ct = default);
    Task AddDocumentAsync(VehicleDocument document, CancellationToken ct = default);
    Task AddCarDocumentAsync(CarDocument carDocument, CancellationToken ct = default);
    Task RemoveDocumentAsync(VehicleDocument document);
    Task AddPictureAsync(Picture picture, CancellationToken ct = default);
    Task AddDocumentPictureAsync(DocumentPicture documentPicture, CancellationToken ct = default);
    Task<DocumentPicture?> GetDocumentPictureAsync(Guid documentId, Guid pictureId, CancellationToken ct = default);
    Task RemoveDocumentPictureAsync(DocumentPicture documentPicture);
    Task RemovePictureAsync(Picture picture);
    Task<int> CountDocumentPicturesAsync(Guid documentId, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}

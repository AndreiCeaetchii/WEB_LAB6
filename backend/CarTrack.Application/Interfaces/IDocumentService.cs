using CarTrack.Application.Dtos;
using CarTrack.Application.Dtos.Cars;
using CarTrack.Application.Dtos.Documents;

namespace CarTrack.Application.Interfaces;

public interface IDocumentService
{
    Task<PaginatedResult<DocumentDto>> GetDocumentsAsync(
        Guid carId, Guid userId, string? kind, int page, int pageSize, CancellationToken ct = default);
    Task<DocumentDto> GetDocumentAsync(Guid carId, Guid userId, Guid documentId, CancellationToken ct = default);
    Task<DocumentDto> CreateDocumentAsync(Guid carId, Guid userId, DocumentInput input, CancellationToken ct = default);
    Task<DocumentDto> UpdateDocumentAsync(Guid carId, Guid userId, Guid documentId, DocumentInput input, CancellationToken ct = default);
    Task DeleteDocumentAsync(Guid carId, Guid userId, Guid documentId, CancellationToken ct = default);
    Task<UploadUrlResponse> GetUploadUrlAsync(Guid carId, Guid userId, Guid documentId, CancellationToken ct = default);
    Task RemovePhotoAsync(Guid carId, Guid userId, Guid documentId, Guid pictureId, CancellationToken ct = default);
}

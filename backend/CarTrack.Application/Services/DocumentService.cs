using CarTrack.Application.Dtos;
using CarTrack.Application.Dtos.Cars;
using CarTrack.Application.Dtos.Documents;
using CarTrack.Application.Exceptions;
using CarTrack.Application.Interfaces;
using CarTrack.Domain.Entities;
using CarTrack.Domain.Interfaces;

namespace CarTrack.Application.Services;

public class DocumentService(
    IDocumentRepository documentRepository,
    ICarRepository carRepository,
    IStorageService storageService) : IDocumentService
{
    private async Task<DocumentDto> ToDtoAsync(VehicleDocument doc, Guid carId, CancellationToken ct)
    {
        var urls = await Task.WhenAll(
            doc.DocumentPictures
                .OrderBy(dp => dp.SortOrder)
                .Select(dp => storageService.GenerateDownloadUrlAsync(dp.Picture.ObjectKey)));
        return new DocumentDto(
            doc.Id, carId, doc.Kind, doc.Insurer, doc.PolicyNumber,
            doc.StartDate, doc.EndDate, doc.Cost, doc.Note,
            urls, doc.CreatedAt, doc.UpdatedAt);
    }

    private async Task AssertMemberAsync(Guid carId, Guid userId, CancellationToken ct)
    {
        _ = await carRepository.GetCarUserAsync(carId, userId, ct)
            ?? throw new ForbiddenException("Access denied");
    }

    public async Task<PaginatedResult<DocumentDto>> GetDocumentsAsync(
        Guid carId, Guid userId, string? kind, int page, int pageSize, CancellationToken ct = default)
    {
        await AssertMemberAsync(carId, userId, ct);
        var result = await documentRepository.GetDocumentsAsync(carId, kind, page, pageSize, ct);
        var dtos = await Task.WhenAll(result.Items.Select(d => ToDtoAsync(d, carId, ct)));
        return new PaginatedResult<DocumentDto>(dtos, result.Total, result.Page, result.PageSize);
    }

    public async Task<DocumentDto> GetDocumentAsync(
        Guid carId, Guid userId, Guid documentId, CancellationToken ct = default)
    {
        await AssertMemberAsync(carId, userId, ct);
        var doc = await documentRepository.GetDocumentByCarAsync(documentId, carId, ct)
            ?? throw new NotFoundException("Document not found");
        return await ToDtoAsync(doc, carId, ct);
    }

    public async Task<DocumentDto> CreateDocumentAsync(
        Guid carId, Guid userId, DocumentInput input, CancellationToken ct = default)
    {
        await AssertMemberAsync(carId, userId, ct);
        var now = DateTime.UtcNow;
        var doc = new VehicleDocument
        {
            Id           = Guid.NewGuid(),
            Kind         = input.Kind,
            Insurer      = input.Insurer,
            PolicyNumber = input.PolicyNumber,
            StartDate    = input.StartDate,
            EndDate      = input.EndDate,
            Cost         = input.Cost,
            Note         = input.Note,
            CreatedAt    = now,
            UpdatedAt    = now
        };
        await documentRepository.AddDocumentAsync(doc, ct);
        await documentRepository.AddCarDocumentAsync(new CarDocument
        {
            CarId      = carId,
            DocumentId = doc.Id,
            CreatedAt  = now
        }, ct);
        await documentRepository.SaveChangesAsync(ct);
        return await ToDtoAsync(doc, carId, ct);
    }

    public async Task<DocumentDto> UpdateDocumentAsync(
        Guid carId, Guid userId, Guid documentId, DocumentInput input, CancellationToken ct = default)
    {
        await AssertMemberAsync(carId, userId, ct);
        var doc = await documentRepository.GetDocumentByCarAsync(documentId, carId, ct)
            ?? throw new NotFoundException("Document not found");

        doc.Kind         = input.Kind;
        doc.Insurer      = input.Insurer;
        doc.PolicyNumber = input.PolicyNumber;
        doc.StartDate    = input.StartDate;
        doc.EndDate      = input.EndDate;
        doc.Cost         = input.Cost;
        doc.Note         = input.Note;
        doc.UpdatedAt    = DateTime.UtcNow;
        await documentRepository.SaveChangesAsync(ct);
        return await ToDtoAsync(doc, carId, ct);
    }

    public async Task DeleteDocumentAsync(
        Guid carId, Guid userId, Guid documentId, CancellationToken ct = default)
    {
        await AssertMemberAsync(carId, userId, ct);
        var doc = await documentRepository.GetDocumentByCarAsync(documentId, carId, ct)
            ?? throw new NotFoundException("Document not found");

        await Task.WhenAll(doc.DocumentPictures
            .Select(dp => storageService.DeleteObjectAsync(dp.Picture.ObjectKey)));

        await documentRepository.RemoveDocumentAsync(doc);
        await documentRepository.SaveChangesAsync(ct);
    }

    public async Task<UploadUrlResponse> GetUploadUrlAsync(
        Guid carId, Guid userId, Guid documentId, CancellationToken ct = default)
    {
        await AssertMemberAsync(carId, userId, ct);
        _ = await documentRepository.GetDocumentByCarAsync(documentId, carId, ct)
            ?? throw new NotFoundException("Document not found");

        var pictureId = Guid.NewGuid();
        var objectKey = storageService.BuildObjectKey("documents", userId, documentId, $"{pictureId}.webp");
        var count     = await documentRepository.CountDocumentPicturesAsync(documentId, ct);

        await documentRepository.AddPictureAsync(new Picture
        {
            Id        = pictureId,
            ObjectKey = objectKey,
            MimeType  = "image/webp",
            CreatedAt = DateTime.UtcNow
        }, ct);
        await documentRepository.AddDocumentPictureAsync(new DocumentPicture
        {
            DocumentId = documentId,
            PictureId  = pictureId,
            SortOrder  = count
        }, ct);
        await documentRepository.SaveChangesAsync(ct);

        var uploadUrl = await storageService.GenerateUploadUrlAsync(objectKey);
        return new UploadUrlResponse(uploadUrl, objectKey, pictureId);
    }

    public async Task RemovePhotoAsync(
        Guid carId, Guid userId, Guid documentId, Guid pictureId, CancellationToken ct = default)
    {
        await AssertMemberAsync(carId, userId, ct);
        var docPicture = await documentRepository.GetDocumentPictureAsync(documentId, pictureId, ct)
            ?? throw new NotFoundException("Photo not found");

        await storageService.DeleteObjectAsync(docPicture.Picture.ObjectKey);
        await documentRepository.RemoveDocumentPictureAsync(docPicture);
        await documentRepository.RemovePictureAsync(docPicture.Picture);
        await documentRepository.SaveChangesAsync(ct);
    }
}

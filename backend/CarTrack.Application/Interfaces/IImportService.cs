using CarTrack.Application.Dtos.Import;

namespace CarTrack.Application.Interfaces;

public interface IImportService
{
    Task<ImportResultDto> ImportAsync(ImportBackupDto backup, Guid userId, CancellationToken ct = default);
}

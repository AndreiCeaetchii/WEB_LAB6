using CarTrack.Application.Dtos;
using CarTrack.Application.Dtos.Expenses;
using CarTrack.Application.Exceptions;
using CarTrack.Application.Interfaces;
using CarTrack.Domain.Entities;

namespace CarTrack.Application.Services;

public class ExpenseService(IExpenseRepository expenseRepository, ICarRepository carRepository) : IExpenseService
{
    private static ExpenseDto ToDto(Expense e)
    {
        var fuel       = e as FuelExpense;
        var repair     = e as RepairExpense;
        var parts      = e as PartsExpense;
        var inspection = e as InspectionExpense;
        var other      = e as OtherExpense;
        return new ExpenseDto(
            e.Id, e.CarId, e.Category, e.Date, e.Cost, e.Note,
            fuel?.FuelUnit,       fuel?.FuelQuantity,    fuel?.FuelUnitPrice, fuel?.OdometerKm,
            repair?.RepairDescription, repair?.Mechanic,
            parts?.PartName,      parts?.PartsQuantity,
            inspection?.NextDueDate,
            other?.OtherDescription,
            e.CreatedAt, e.UpdatedAt);
    }

    private static Expense BuildEntity(Guid carId, ExpenseInput input, Guid? id = null, DateTime? createdAt = null)
    {
        var now = DateTime.UtcNow;
        Expense expense = input.Category switch
        {
            "fuel" => new FuelExpense
            {
                FuelUnit      = input.FuelUnit ?? "L",
                FuelQuantity  = input.FuelQuantity ?? 0,
                FuelUnitPrice = input.FuelUnitPrice ?? 0,
                OdometerKm    = input.OdometerKm
            },
            "repair" => new RepairExpense
            {
                RepairDescription = input.RepairDescription ?? string.Empty,
                Mechanic          = input.Mechanic
            },
            "parts" => new PartsExpense
            {
                PartName      = input.PartName ?? string.Empty,
                PartsQuantity = input.PartsQuantity ?? 1
            },
            "inspection" => new InspectionExpense
            {
                NextDueDate = input.NextDueDate
            },
            _ => new OtherExpense
            {
                OtherDescription = input.OtherDescription
            }
        };
        expense.Id        = id ?? Guid.NewGuid();
        expense.CarId     = carId;
        expense.Category  = input.Category;
        expense.Date      = input.Date;
        expense.Cost      = input.Cost;
        expense.Note      = input.Note;
        expense.CreatedAt = createdAt ?? now;
        expense.UpdatedAt = now;
        return expense;
    }

    private async Task AssertMemberAsync(Guid carId, Guid userId, CancellationToken ct)
    {
        _ = await carRepository.GetCarUserAsync(carId, userId, ct)
            ?? throw new ForbiddenException("Access denied");
    }

    public async Task<PaginatedResult<ExpenseDto>> GetExpensesAsync(
        Guid carId, Guid userId, string? category, DateOnly? from, DateOnly? to,
        int page, int pageSize, CancellationToken ct = default)
    {
        await AssertMemberAsync(carId, userId, ct);
        var result = await expenseRepository.GetExpensesAsync(carId, category, from, to, page, pageSize, ct);
        var dtos = result.Items.Select(ToDto).ToList();
        return new PaginatedResult<ExpenseDto>(dtos, result.Total, result.Page, result.PageSize);
    }

    public async Task<ExpenseDto> GetExpenseAsync(
        Guid carId, Guid userId, Guid expenseId, CancellationToken ct = default)
    {
        await AssertMemberAsync(carId, userId, ct);
        var expense = await expenseRepository.GetExpenseByCarAsync(expenseId, carId, ct)
            ?? throw new NotFoundException("Expense not found");
        return ToDto(expense);
    }

    public async Task<ExpenseDto> CreateExpenseAsync(
        Guid carId, Guid userId, ExpenseInput input, CancellationToken ct = default)
    {
        await AssertMemberAsync(carId, userId, ct);
        var expense = BuildEntity(carId, input);
        await expenseRepository.AddExpenseAsync(expense, ct);
        await expenseRepository.SaveChangesAsync(ct);
        return ToDto(expense);
    }

    public async Task<ExpenseDto> UpdateExpenseAsync(
        Guid carId, Guid userId, Guid expenseId, ExpenseInput input, CancellationToken ct = default)
    {
        await AssertMemberAsync(carId, userId, ct);
        var existing = await expenseRepository.GetExpenseByCarAsync(expenseId, carId, ct)
            ?? throw new NotFoundException("Expense not found");

        await expenseRepository.RemoveExpenseAsync(existing);
        var replacement = BuildEntity(carId, input, id: expenseId, createdAt: existing.CreatedAt);
        await expenseRepository.AddExpenseAsync(replacement, ct);
        await expenseRepository.SaveChangesAsync(ct);
        return ToDto(replacement);
    }

    public async Task DeleteExpenseAsync(
        Guid carId, Guid userId, Guid expenseId, CancellationToken ct = default)
    {
        await AssertMemberAsync(carId, userId, ct);
        var expense = await expenseRepository.GetExpenseByCarAsync(expenseId, carId, ct)
            ?? throw new NotFoundException("Expense not found");
        await expenseRepository.RemoveExpenseAsync(expense);
        await expenseRepository.SaveChangesAsync(ct);
    }
}

using BTMNAdmin.Data;
using Microsoft.EntityFrameworkCore;

namespace BTMNAdmin.Services;

public class FejlesztopedagogusService(
    IDbContextFactory<ApplicationDbContext> dbFactory)
{
    public async Task<Fejlesztopedagogus?> GetFejlesztopedagogusAsync(
        string identityUserId)
    {
        await using var db = await dbFactory.CreateDbContextAsync();

        return await db.Fejlesztopedagogusok
            .SingleOrDefaultAsync(p => p.ApplicationUserId == identityUserId);
    }

    public async Task<bool> UpdateNevAsync(string identityUserId, string nev)
    {
        nev = nev.Trim();

        if (nev.Length is < 1 or > 150)
            throw new ArgumentException(
                "A név 1–150 karakter hosszú lehet.", nameof(nev));

        await using var db = await dbFactory.CreateDbContextAsync();

        var pedagogus = await db.Fejlesztopedagogusok
            .SingleOrDefaultAsync(p => p.ApplicationUserId == identityUserId);

        if (pedagogus is null)
            return false;

        pedagogus.Nev = nev;
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<List<TLabel>> GetLabelsAsync<TLabel>(string identityUserId)
        where TLabel : AbstractFejlesztoLabel
    {
        await using var db = await dbFactory.CreateDbContextAsync();

        return await db.Set<TLabel>()
            .AsNoTracking()
            .Where(x => x.Fejlesztopedagogus.ApplicationUserId == identityUserId)
            .OrderBy(x => x.Nev)
            .ToListAsync();
    }

    public async Task<bool> SaveLabelAsync<TLabel>(
        string identityUserId,
        int? id,
        string nev,
        int maxLength = 200)
        where TLabel : AbstractFejlesztoLabel, new()
    {
        nev = nev.Trim();

        if (nev.Length is < 1 || nev.Length > maxLength)
            throw new ArgumentException(
                $"A név 1–{maxLength} karakter hosszú lehet.", nameof(nev));

        await using var db = await dbFactory.CreateDbContextAsync();

        if (id is null)
        {
            var pedagogus = await db.Fejlesztopedagogusok
                .SingleOrDefaultAsync(p => p.ApplicationUserId == identityUserId);

            if (pedagogus is null)
                return false;

            await using var transaction = await db.Database.BeginTransactionAsync();

            var entity = new TLabel
            {
                FejlesztopedagogusId = pedagogus.Id,
                Nev = nev
            };
            db.Set<TLabel>().Add(entity);
            await db.SaveChangesAsync();

            SetActiveId<TLabel>(pedagogus, entity.Id);
            await db.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }
        else
        {
            var entity = await db.Set<TLabel>().SingleOrDefaultAsync(x =>
                x.Id == id.Value &&
                x.Fejlesztopedagogus.ApplicationUserId == identityUserId);

            if (entity is null)
                return false;

            entity.Nev = nev;
        }

        await db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteLabelAsync<TLabel>(string identityUserId, int id) where TLabel : AbstractFejlesztoLabel
    {
        await using var db = await dbFactory.CreateDbContextAsync();

        var entity = await db.Set<TLabel>().SingleOrDefaultAsync(x =>
            x.Id == id &&
            x.Fejlesztopedagogus.ApplicationUserId == identityUserId);

        if (entity is null)
            return false;

        var pedagogus = await db.Fejlesztopedagogusok.SingleAsync(p => p.Id == entity.FejlesztopedagogusId);

        if (GetActiveId<TLabel>(pedagogus) == id)
        {
            // Az Id alapján az utoljára hozzáadott megmaradó elem.
            int? ujAktivId = await db.Set<TLabel>()
                .Where(x => x.FejlesztopedagogusId == pedagogus.Id && x.Id != id)
                .OrderByDescending(x => x.Id)
                .Select(x => (int?)x.Id)
                .FirstOrDefaultAsync();

            SetActiveId<TLabel>(pedagogus, ujAktivId);
        }

        db.Set<TLabel>().Remove(entity);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SetActiveLabelAsync<TLabel>(
        string identityUserId, int? labelId)
        where TLabel : AbstractFejlesztoLabel
    {
        await using var db = await dbFactory.CreateDbContextAsync();

        var pedagogus = await db.Fejlesztopedagogusok
            .SingleOrDefaultAsync(p => p.ApplicationUserId == identityUserId);

        if (pedagogus is null)
            return false;

        if (labelId is not null &&
            !await db.Set<TLabel>().AnyAsync(x =>
                x.Id == labelId.Value &&
                x.FejlesztopedagogusId == pedagogus.Id))
            return false;

        SetActiveId<TLabel>(pedagogus, labelId);
        await db.SaveChangesAsync();
        return true;
    }

    private static int? GetActiveId<TLabel>(Fejlesztopedagogus pedagogus)
        where TLabel : AbstractFejlesztoLabel
    {
        if (typeof(TLabel) == typeof(Iskola))
            return pedagogus.ActiveIskola;
        if (typeof(TLabel) == typeof(Szakszolgalat))
            return pedagogus.ActiveSzakszolgalat;
        if (typeof(TLabel) == typeof(Tanev))
            return pedagogus.ActiveTanev;

        throw new NotSupportedException($"Nem támogatott labeltípus: {typeof(TLabel).Name}");
    }

    private static void SetActiveId<TLabel>(
        Fejlesztopedagogus pedagogus, int? labelId)
        where TLabel : AbstractFejlesztoLabel
    {
        if (typeof(TLabel) == typeof(Iskola))
            pedagogus.ActiveIskola = labelId;
        else if (typeof(TLabel) == typeof(Szakszolgalat))
            pedagogus.ActiveSzakszolgalat = labelId;
        else if (typeof(TLabel) == typeof(Tanev))
            pedagogus.ActiveTanev = labelId;
        else
            throw new NotSupportedException($"Nem támogatott labeltípus: {typeof(TLabel).Name}");
    }
}
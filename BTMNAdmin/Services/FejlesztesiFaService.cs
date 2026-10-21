using System.Linq.Expressions;
using BTMNAdmin.Data;
using Microsoft.EntityFrameworkCore;

namespace BTMNAdmin.Services;

public class FejlesztesiFaService(
    IDbContextFactory<ApplicationDbContext> dbFactory)
{
    public async Task<FejlesztesiFa> GetFejlesztesiFaAsync(string identityUserId)
    {
        await using var db = await dbFactory.CreateDbContextAsync();

        var teruletek = await db.FejlesztesiTeruletek
            .AsNoTracking()
            .Where(x => x.Fejlesztopedagogus.ApplicationUserId == identityUserId)
            .OrderBy(x => x.Nev).ThenBy(x => x.Id)
            .Select(x => new { x.Id, x.Nev })
            .ToListAsync();

        var celok = await db.FejlesztesiCelok
            .AsNoTracking()
            .Where(x => x.Label.Fejlesztopedagogus.ApplicationUserId == identityUserId)
            .OrderBy(x => x.Nev).ThenBy(x => x.Id)
            .Select(x => new { x.Id, x.Nev, TeruletId = x.LabelId })
            .ToListAsync();

        var eszkozok = await db.FejlesztesiEszkozok
            .AsNoTracking()
            .Where(x => x.Label.Label.Fejlesztopedagogus.ApplicationUserId == identityUserId)
            .OrderBy(x => x.Nev).ThenBy(x => x.Id)
            .Select(x => new { x.Id, x.Nev, CelId = x.LabelId })
            .ToListAsync();

        var eszkozokCelonkent = eszkozok.ToLookup(x => x.CelId);
        var celokTeruletenkent = celok.ToLookup(x => x.TeruletId);

        return new FejlesztesiFa(
            teruletek.Select(terulet => new TeruletNode(
                terulet.Id,
                terulet.Nev,
                celokTeruletenkent[terulet.Id].Select(cel => new CelNode(
                    cel.Id,
                    cel.Nev,
                    eszkozokCelonkent[cel.Id]
                        .Select(eszkoz => new EszkozNode(eszkoz.Id, eszkoz.Nev))
                        .ToList()))
                    .ToList()))
                .ToList());
    }

    // Returns null when the user or specified parent does not exist
    // or does not belong to the user.
    public async Task<int?> CreateTeruletAsync(string identityUserId, string nev)
    {
        nev = ValidateNev(nev);
        await using var db = await dbFactory.CreateDbContextAsync();

        var pedagogusId = await db.Fejlesztopedagogusok
            .Where(x => x.ApplicationUserId == identityUserId)
            .Select(x => (int?)x.Id)
            .SingleOrDefaultAsync();

        if (pedagogusId is null)
            return null;

        var terulet = new FejlesztesiTerulet
        {
            FejlesztopedagogusId = pedagogusId.Value,
            Nev = nev
        };
        db.FejlesztesiTeruletek.Add(terulet);
        await db.SaveChangesAsync();
        return terulet.Id;
    }

    public Task<int?> CreateCelAsync(
        string identityUserId, int teruletId, string nev) =>
        CreateChildAsync<FejlesztesiCel, FejlesztesiTerulet>(
            teruletId, nev,
            x => x.Id == teruletId &&
                 x.Fejlesztopedagogus.ApplicationUserId == identityUserId);

    public Task<int?> CreateEszkozAsync(
        string identityUserId, int celId, string nev) =>
        CreateChildAsync<FejlesztesiEszkoz, FejlesztesiCel>(
            celId, nev,
            x => x.Id == celId &&
                 x.Label.Fejlesztopedagogus.ApplicationUserId == identityUserId);

    public Task<bool> SetTeruletNevAsync(
        string identityUserId, int id, string nev) =>
        SetNevAsync<FejlesztesiTerulet>(
            x => x.Id == id &&
                 x.Fejlesztopedagogus.ApplicationUserId == identityUserId,
            nev);

    public Task<bool> SetCelNevAsync(
        string identityUserId, int id, string nev) =>
        SetNevAsync<FejlesztesiCel>(
            x => x.Id == id &&
                 x.Label.Fejlesztopedagogus.ApplicationUserId == identityUserId,
            nev);

    public Task<bool> SetEszkozNevAsync(
        string identityUserId, int id, string nev) =>
        SetNevAsync<FejlesztesiEszkoz>(
            x => x.Id == id &&
                 x.Label.Label.Fejlesztopedagogus.ApplicationUserId == identityUserId,
            nev);

    public Task<bool> DeleteTeruletAsync(string identityUserId, int id) =>
        DeleteAsync<FejlesztesiTerulet>(
            x => x.Id == id &&
                 x.Fejlesztopedagogus.ApplicationUserId == identityUserId);

    public Task<bool> DeleteCelAsync(string identityUserId, int id) =>
        DeleteAsync<FejlesztesiCel>(
            x => x.Id == id &&
                 x.Label.Fejlesztopedagogus.ApplicationUserId == identityUserId);

    public Task<bool> DeleteEszkozAsync(string identityUserId, int id) =>
        DeleteAsync<FejlesztesiEszkoz>(
            x => x.Id == id &&
                 x.Label.Label.Fejlesztopedagogus.ApplicationUserId == identityUserId);

    private async Task<int?> CreateChildAsync<TChild, TParent>(
        int parentId,
        string nev,
        Expression<Func<TParent, bool>> ownedParent)
        where TChild : AbstractLabelLabel<TParent>, new()
        where TParent : AbstractLabel
    {
        nev = ValidateNev(nev);
        await using var db = await dbFactory.CreateDbContextAsync();

        if (!await db.Set<TParent>().AnyAsync(ownedParent))
            return null;

        var child = new TChild { LabelId = parentId, Nev = nev };
        db.Set<TChild>().Add(child);
        await db.SaveChangesAsync();
        return child.Id;
    }

    private async Task<bool> SetNevAsync<T>(
        Expression<Func<T, bool>> ownedEntity, string nev)
        where T : AbstractLabel
    {
        nev = ValidateNev(nev);
        await using var db = await dbFactory.CreateDbContextAsync();

        var entity = await db.Set<T>().SingleOrDefaultAsync(ownedEntity);
        if (entity is null)
            return false;

        entity.Nev = nev;
        await db.SaveChangesAsync();
        return true;
    }

    private async Task<bool> DeleteAsync<T>(
        Expression<Func<T, bool>> ownedEntity)
        where T : AbstractLabel
    {
        await using var db = await dbFactory.CreateDbContextAsync();

        var entity = await db.Set<T>().SingleOrDefaultAsync(ownedEntity);
        if (entity is null)
            return false;

        db.Set<T>().Remove(entity);
        await db.SaveChangesAsync();
        return true;
    }

    private static string ValidateNev(string nev)
    {
        ArgumentNullException.ThrowIfNull(nev);
        nev = nev.Trim();

        if (nev.Length is < 1 or > 200)
            throw new ArgumentException(
                "A név 1–200 karakter hosszú lehet.", nameof(nev));

        return nev;
    }
}
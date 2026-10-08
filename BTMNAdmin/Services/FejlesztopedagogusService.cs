using BTMNAdmin.Data;
using Microsoft.EntityFrameworkCore;

namespace BTMNAdmin.Services;

public class FejlesztopedagogusService(ApplicationDbContext db)
{
    public Task<string?> GetNevAsync(string identityUserId) =>
        db.Fejlesztopedagogusok
            .AsNoTracking()
            .Where(p => p.ApplicationUserId == identityUserId)
            .Select(p => p.Nev)
            .SingleOrDefaultAsync();

    public async Task<bool> UpdateNevAsync(string identityUserId, string nev)
    {
        nev = nev.Trim();

        if (nev.Length is < 1 or > 150)
            throw new ArgumentException("A név 1–150 karakter hosszú lehet.", nameof(nev));

        var pedagogus = await db.Fejlesztopedagogusok
            .SingleOrDefaultAsync(p => p.ApplicationUserId == identityUserId);

        if (pedagogus is null)
            return false;

        pedagogus.Nev = nev;
        await db.SaveChangesAsync();
        return true;
    }
}

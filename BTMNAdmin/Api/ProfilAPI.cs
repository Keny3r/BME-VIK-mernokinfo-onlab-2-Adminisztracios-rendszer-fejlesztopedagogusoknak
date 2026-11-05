using BTMNAdmin.Data;
using BTMNAdmin.Services;
using Microsoft.AspNetCore.Identity;

class ProfilAPI
{
    public static async Task<IResult> GetProfilData (
        HttpContext httpContext,
        UserManager<ApplicationUser> userManager,
        FejlesztopedagogusService pedagogusService)
    {
        httpContext.Response.Headers.CacheControl = "no-store";

        var userId = userManager.GetUserId(httpContext.User);
        if (userId is null)
            return Results.Unauthorized();

        var pedagogus = await pedagogusService.GetFejlesztopedagogusAsync(userId);
        if (pedagogus is null)
            return Results.NotFound();

        var iskolak = await pedagogusService.GetLabelsAsync<Iskola>(userId);
        var szakszolgalatok = await pedagogusService.GetLabelsAsync<Szakszolgalat>(userId);
        var tanevek = await pedagogusService.GetLabelsAsync<Tanev>(userId);

        return Results.Ok(new
        {
            pedagogusNeve = pedagogus.Nev,
            iskola = new
            {
                active = iskolak.FirstOrDefault(x => x.Id == pedagogus.ActiveIskola)?.Nev,
                suggestions = iskolak.Select(x => x.Nev).Distinct().ToArray()
            },
            szakszolgalat = new
            {
                active = szakszolgalatok
                    .FirstOrDefault(x => x.Id == pedagogus.ActiveSzakszolgalat)?.Nev,
                suggestions = szakszolgalatok.Select(x => x.Nev).Distinct().ToArray()
            },
            tanev = new
            {
                active = tanevek.FirstOrDefault(x => x.Id == pedagogus.ActiveTanev)?.Nev,
                suggestions = tanevek.Select(x => x.Nev).Distinct().ToArray()
            }
        });
    }
}
using BTMNAdmin.Data;
using BTMNAdmin.Services;
using Microsoft.AspNetCore.Identity;

class BeallitasokAPI
{
    public static async Task<IResult> GetBeallitasokData(
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

        var nevLabelek = await pedagogusService.GetLabelsAsync<NevLabel>(userId);
        var anyjaNeveLabelek = await pedagogusService.GetLabelsAsync<AnyjaNeveLabel>(userId);
        var szuletesiHelyEsIdoLabelek = await pedagogusService.GetLabelsAsync<SzuletesiHelyEsIdoLabel>(userId);
        var forgalmiSzamLabelek = await pedagogusService.GetLabelsAsync<ForgalmiSzamLabel>(userId);
        var iktatoszamLabelek = await pedagogusService.GetLabelsAsync<IktatoszamLabel>(userId);
        var fejlesztesFormajaLabelek = await pedagogusService.GetLabelsAsync<FejlesztesFormajaLabel>(userId);

        return Results.Ok(new
        {
            nev = nevLabelek.Select(x => x.Nev).Distinct().ToArray(),
            anyjaNeve = anyjaNeveLabelek.Select(x => x.Nev).Distinct().ToArray(),
            szuletesiHelyEsIdo = szuletesiHelyEsIdoLabelek.Select(x => x.Nev).Distinct().ToArray(),
            forgalmiSzam = forgalmiSzamLabelek.Select(x => x.Nev).Distinct().ToArray(),
            iktatoszam = iktatoszamLabelek.Select(x => x.Nev).Distinct().ToArray(),
            fejlesztesFormaja = fejlesztesFormajaLabelek.Select(x => x.Nev).Distinct().ToArray()
        });
    }
}

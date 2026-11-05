using BTMNAdmin.Data;
using BTMNAdmin.Services;
using Microsoft.AspNetCore.Identity;

class FejlesztesiFaAPI
{
    public static async Task<IResult> GetFejlesztesiFaData(
        HttpContext httpContext,
        UserManager<ApplicationUser> userManager,
        FejlesztopedagogusService pedagogusService,
        FejlesztesiFaService fejlesztesiFaService)
    {
        httpContext.Response.Headers.CacheControl = "no-store";

        var userId = userManager.GetUserId(httpContext.User);
        if (userId is null)
            return Results.Unauthorized();

        var pedagogus = await pedagogusService.GetFejlesztopedagogusAsync(userId);
        if (pedagogus is null)
            return Results.NotFound();

        var fa = await fejlesztesiFaService.GetFejlesztesiFaAsync(userId);
        return Results.Ok(fa);
    }
}
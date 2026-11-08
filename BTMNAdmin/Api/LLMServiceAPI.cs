using BTMNAdmin.Data;
using BTMNAdmin.Services;
using Microsoft.AspNetCore.Identity;

namespace BTMNAdmin.Api;

public static class LLMServiceAPI
{
    public static async Task<IResult> Extract(
        HttpContext httpContext,
        ExtractApiRequest request,
        UserManager<ApplicationUser> userManager,
        FejlesztesiFaService faService,
        LlmService llmService,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request?.Text))
        {
            return Results.BadRequest(new { error = "A megadott szöveg üres." });
        }

        var userId = userManager.GetUserId(httpContext.User);
        if (userId is null)
        {
            return Results.Unauthorized();
        }

        var fa = await faService.GetFejlesztesiFaAsync(userId);
        var teruletek = fa.Teruletek
            .Select(t => new FejlesztesiTeruletDto(t.Id, t.Nev))
            .ToList();

        var result = await llmService.ExtractAsync(request.Text, teruletek, cancellationToken);
        if (result is null)
        {
            return Results.StatusCode(StatusCodes.Status503ServiceUnavailable);
        }

        return Results.Ok(result);
    }
}

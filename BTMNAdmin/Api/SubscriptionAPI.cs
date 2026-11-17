using BTMNAdmin.Data;
using BTMNAdmin.Services;
using Microsoft.AspNetCore.Identity;

namespace BTMNAdmin.Api;

public static class SubscriptionAPI
{
    public static void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/subscription");

        group.MapPost("/create-checkout-session", async (
            HttpContext httpContext,
            UserManager<ApplicationUser> userManager,
            SubscriptionService subscriptionService) =>
        {
            var user = await userManager.GetUserAsync(httpContext.User);
            if (user is null)
                return Results.Unauthorized();

            try
            {
                var baseUrl = $"{httpContext.Request.Scheme}://{httpContext.Request.Host}";
                var url = await subscriptionService.CreateCheckoutSessionAsync(user, baseUrl);
                return Results.Ok(new { url });
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        }).RequireAuthorization();

        group.MapPost("/customer-portal", async (
            HttpContext httpContext,
            UserManager<ApplicationUser> userManager,
            SubscriptionService subscriptionService) =>
        {
            var user = await userManager.GetUserAsync(httpContext.User);
            if (user is null)
                return Results.Unauthorized();

            try
            {
                var baseUrl = $"{httpContext.Request.Scheme}://{httpContext.Request.Host}";
                var url = await subscriptionService.CreateCustomerPortalSessionAsync(user, baseUrl);
                return Results.Ok(new { url });
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        }).RequireAuthorization();

        group.MapGet("/status", async (
            HttpContext httpContext,
            UserManager<ApplicationUser> userManager,
            SubscriptionService subscriptionService) =>
        {
            var user = await userManager.GetUserAsync(httpContext.User);
            if (user is null)
                return Results.Unauthorized();

            var status = subscriptionService.GetStatus(user);
            return Results.Ok(status);
        }).RequireAuthorization();

        // A Stripe webhook nem igényel bejelentkezést, mert a Stripe küldi;
        // a kérést a Stripe-Signature fejléc és a WebhookSecret validálja a Service-ben.
        group.MapPost("/webhook", async (
            HttpContext httpContext,
            SubscriptionService subscriptionService) =>
        {
            using var reader = new StreamReader(httpContext.Request.Body);
            var json = await reader.ReadToEndAsync();
            var stripeSignature = httpContext.Request.Headers["Stripe-Signature"];

            var success = await subscriptionService.HandleWebhookAsync(json, stripeSignature);
            return success ? Results.Ok() : Results.BadRequest();
        }).AllowAnonymous();
    }
}

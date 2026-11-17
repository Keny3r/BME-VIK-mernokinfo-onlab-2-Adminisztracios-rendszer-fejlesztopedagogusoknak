using BTMNAdmin.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;

namespace BTMNAdmin.Services;

public class SubscriptionService(
    UserManager<ApplicationUser> userManager,
    IConfiguration configuration,
    ILogger<SubscriptionService> logger)
{
    public async Task<string> CreateCheckoutSessionAsync(ApplicationUser user, string baseUrl)
    {
        var priceId = configuration["Stripe:PriceId"];
        if (string.IsNullOrWhiteSpace(priceId) || priceId.Contains("YOUR_PRICE_ID") || priceId.Contains("..."))
        {
            throw new InvalidOperationException("A Stripe:PriceId nincs beállítva a konfigurációban (user-secrets / környezeti változó / appsettings.json).");
        }

        var options = new SessionCreateOptions
        {
            LineItems =
            [
                new SessionLineItemOptions
                {
                    Price = priceId,
                    Quantity = 1,
                },
            ],
            Mode = "subscription",
            SuccessUrl = $"{baseUrl}/profil?session_id={{CHECKOUT_SESSION_ID}}",
            CancelUrl = $"{baseUrl}/profil",
            ClientReferenceId = user.Id,
            Metadata = new Dictionary<string, string>
            {
                { "userId", user.Id }
            }
        };

        if (!string.IsNullOrEmpty(user.StripeCustomerId))
        {
            options.Customer = user.StripeCustomerId;
        }
        else if (!string.IsNullOrEmpty(user.Email))
        {
            options.CustomerEmail = user.Email;
        }

        var service = new SessionService();
        var session = await service.CreateAsync(options);

        return session.Url;
    }

    public async Task<string> CreateCustomerPortalSessionAsync(ApplicationUser user, string baseUrl)
    {
        if (string.IsNullOrEmpty(user.StripeCustomerId))
        {
            throw new InvalidOperationException("A felhasználónak még nincs Stripe ügyfélprofilja.");
        }

        var options = new Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = user.StripeCustomerId,
            ReturnUrl = $"{baseUrl}/profil",
        };

        var service = new Stripe.BillingPortal.SessionService();
        var session = await service.CreateAsync(options);

        return session.Url;
    }

    public object GetStatus(ApplicationUser user)
    {
        return new
        {
            isActive = user.IsSubscriptionActive,
            expiresAt = user.SubscriptionExpiresAt,
            hasCustomerProfile = !string.IsNullOrEmpty(user.StripeCustomerId)
        };
    }

    public async Task<bool> HandleWebhookAsync(string json, string? stripeSignature)
    {
        var webhookSecret = configuration["Stripe:WebhookSecret"];

        Event stripeEvent;
        try
        {
            if (!string.IsNullOrWhiteSpace(webhookSecret) && !webhookSecret.Contains("..."))
            {
                stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, webhookSecret, tolerance: 300, throwOnApiVersionMismatch: false);
            }
            else
            {
                stripeEvent = EventUtility.ParseEvent(json, throwOnApiVersionMismatch: false);
                logger.LogWarning("Stripe Webhook aláírás-ellenőrzés nélkül futott, mert a Stripe:WebhookSecret nincs konfigurálva.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Hiba a Stripe webhook aláírás ellenőrzésekor.");
            return false;
        }

        logger.LogInformation("Stripe webhook esemény feldolgozása: {EventType}", stripeEvent.Type);

        switch (stripeEvent.Type)
        {
            case "checkout.session.completed":
            {
                if (stripeEvent.Data.Object is Session session)
                {
                    var userId = session.ClientReferenceId
                        ?? (session.Metadata != null && session.Metadata.TryGetValue("userId", out var id) ? id : null);

                    ApplicationUser? user = null;
                    if (!string.IsNullOrEmpty(userId))
                    {
                        user = await userManager.FindByIdAsync(userId);
                    }
                    else if (!string.IsNullOrEmpty(session.CustomerEmail))
                    {
                        user = await userManager.FindByEmailAsync(session.CustomerEmail);
                    }

                    if (user != null)
                    {
                        user.StripeCustomerId = session.CustomerId;
                        user.StripeSubscriptionId = session.SubscriptionId;
                        user.IsSubscriptionActive = true;
                        await userManager.UpdateAsync(user);
                        logger.LogInformation("Előfizetés sikeresen aktiválva a felhasználónál: {UserId}", user.Id);
                    }
                }
                break;
            }

            case "customer.subscription.updated":
            {
                if (stripeEvent.Data.Object is Subscription subscription)
                {
                    var user = await userManager.Users.FirstOrDefaultAsync(u =>
                        u.StripeSubscriptionId == subscription.Id || u.StripeCustomerId == subscription.CustomerId);

                    if (user != null)
                    {
                        user.IsSubscriptionActive = subscription.Status == "active" || subscription.Status == "trialing";
                        user.SubscriptionExpiresAt = subscription.Items?.Data?.FirstOrDefault()?.CurrentPeriodEnd;
                        await userManager.UpdateAsync(user);
                        logger.LogInformation("Előfizetés státusz frissítve ({Status}) a felhasználónál: {UserId}", subscription.Status, user.Id);
                    }
                }
                break;
            }

            case "customer.subscription.deleted":
            {
                if (stripeEvent.Data.Object is Subscription subscription)
                {
                    var user = await userManager.Users.FirstOrDefaultAsync(u =>
                        u.StripeSubscriptionId == subscription.Id || u.StripeCustomerId == subscription.CustomerId);

                    if (user != null)
                    {
                        user.IsSubscriptionActive = false;
                        await userManager.UpdateAsync(user);
                        logger.LogInformation("Előfizetés lemondva/törölve a felhasználónál: {UserId}", user.Id);
                    }
                }
                break;
            }
        }

        return true;
    }
}

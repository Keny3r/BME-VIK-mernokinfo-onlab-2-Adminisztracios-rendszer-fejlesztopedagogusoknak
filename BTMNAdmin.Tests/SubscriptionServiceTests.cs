using BTMNAdmin.Data;
using BTMNAdmin.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace BTMNAdmin.Tests;

public class SubscriptionServiceTests
{
    private static (SubscriptionService Service, ApplicationDbContext Db, ApplicationUser User) SetupTestContext()
    {
        var db = TestDbContextFactory.CreateInMemoryDbContext();
        var (userManager, _) = TestDbContextFactory.CreateTestIdentity(db);

        var config = new ConfigurationBuilder().Build();
        var logger = NullLogger<SubscriptionService>.Instance;
        var service = new SubscriptionService(userManager, config, logger);

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid().ToString(),
            UserName = "elozo.pedagogus@btmnadmin.hu",
            Email = "elozo.pedagogus@btmnadmin.hu",
            IsSubscriptionActive = false
        };

        db.Users.Add(user);
        db.SaveChanges();

        return (service, db, user);
    }

    [Fact]
    public async Task HandleWebhookAsync_CheckoutSessionCompleted_ActivatesSubscription()
    {
        // Arrange
        var (service, db, user) = SetupTestContext();

        var webhookJson = $$"""
        {
          "id": "evt_test_checkout",
          "object": "event",
          "api_version": "2024-06-20",
          "type": "checkout.session.completed",
          "data": {
            "object": {
              "id": "cs_test_123",
              "object": "checkout.session",
              "customer": "cus_pedagogus_123",
              "subscription": "sub_pedagogus_456",
              "client_reference_id": "{{user.Id}}"
            }
          }
        }
        """;

        // Act
        var handled = await service.HandleWebhookAsync(webhookJson, stripeSignature: null);

        // Assert
        Assert.True(handled, "A webhook esemény feldolgozásának sikeresnek kell lennie.");

        var updatedUser = await db.Users.FindAsync(user.Id);
        Assert.NotNull(updatedUser);
        Assert.True(updatedUser.IsSubscriptionActive, "A felhasználónak aktív előfizetővé kell válnia.");
        Assert.Equal("cus_pedagogus_123", updatedUser.StripeCustomerId);
        Assert.Equal("sub_pedagogus_456", updatedUser.StripeSubscriptionId);
    }

    [Fact]
    public async Task HandleWebhookAsync_CustomerSubscriptionDeleted_DeactivatesSubscription()
    {
        // Arrange
        var (service, db, user) = SetupTestContext();
        user.IsSubscriptionActive = true;
        user.StripeCustomerId = "cus_pedagogus_123";
        user.StripeSubscriptionId = "sub_pedagogus_456";
        db.SaveChanges();

        var webhookJson = """
        {
          "id": "evt_test_cancel",
          "object": "event",
          "api_version": "2024-06-20",
          "type": "customer.subscription.deleted",
          "data": {
            "object": {
              "id": "sub_pedagogus_456",
              "object": "subscription",
              "customer": "cus_pedagogus_123",
              "status": "canceled"
            }
          }
        }
        """;

        // Act
        var handled = await service.HandleWebhookAsync(webhookJson, stripeSignature: null);

        // Assert
        Assert.True(handled, "A webhook esemény feldolgozásának sikeresnek kell lennie.");

        var updatedUser = await db.Users.FindAsync(user.Id);
        Assert.NotNull(updatedUser);
        Assert.False(updatedUser.IsSubscriptionActive, "A lemondott előfizetés után a felhasználónak inaktívvá kell válnia.");
    }
}

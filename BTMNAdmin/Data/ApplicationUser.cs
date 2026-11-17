using Microsoft.AspNetCore.Identity;

namespace BTMNAdmin.Data;

// Add profile data for application users by adding properties to the ApplicationUser class
public class ApplicationUser : IdentityUser
{
    public string? StripeCustomerId { get; set; }
    public string? StripeSubscriptionId { get; set; }
    public bool IsSubscriptionActive { get; set; } = false;
    public DateTime? SubscriptionExpiresAt { get; set; }
}

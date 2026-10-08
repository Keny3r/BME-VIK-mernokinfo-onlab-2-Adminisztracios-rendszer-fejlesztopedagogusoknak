using BTMNAdmin.Data;
using Microsoft.AspNetCore.Identity;

namespace BTMNAdmin.Services;

public class RegistrationService(
    UserManager<ApplicationUser> userManager,
    IUserStore<ApplicationUser> userStore,
    ApplicationDbContext db)
{
    public async Task<(IdentityResult Result, ApplicationUser User)> RegisterAsync(
        string email,
        string password)
    {
        var user = new ApplicationUser();

        await userStore.SetUserNameAsync(user, email, CancellationToken.None);

        if (!userManager.SupportsUserEmail)
            throw new NotSupportedException("A felhasználótárolónak támogatnia kell az e-mail-címeket.");

        var emailStore = (IUserEmailStore<ApplicationUser>)userStore;
        await emailStore.SetEmailAsync(user, email, CancellationToken.None);

        await using var transaction = await db.Database.BeginTransactionAsync();

        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
            return (result, user);

        db.Fejlesztopedagogusok.Add(new Fejlesztopedagogus
        {
            ApplicationUserId = await userManager.GetUserIdAsync(user),
            Nev = "Ismeretlen pedagógus"
        });

        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        return (result, user);
    }
}
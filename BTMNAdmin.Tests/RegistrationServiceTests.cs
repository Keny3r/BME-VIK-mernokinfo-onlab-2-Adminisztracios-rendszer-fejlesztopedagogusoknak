using BTMNAdmin.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BTMNAdmin.Tests;

public class RegistrationServiceTests
{
    [Fact]
    public async Task RegisterAsync_ValidCredentials_CreatesUserAndPedagogusWithDefaultLabels()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryDbContext();
        var (userManager, userStore) = TestDbContextFactory.CreateTestIdentity(db);
        var service = new RegistrationService(userManager, userStore, db);

        var email = "teszt.pedagogus@btmnadmin.hu";
        var password = "Password123!";

        // Act
        var (result, user) = await service.RegisterAsync(email, password);

        // Assert
        Assert.True(result.Succeeded, "A felhasználó regisztrációjának sikeresnek kell lennie.");
        Assert.NotNull(user.Id);

        var pedagogus = await db.Fejlesztopedagogusok
            .Include(p => p.NevLabelek)
            .Include(p => p.FejlesztesFormajaLabelek)
            .FirstOrDefaultAsync(p => p.ApplicationUserId == user.Id);

        Assert.NotNull(pedagogus);
        Assert.Equal("Ismeretlen pedagógus", pedagogus.Nev);
        Assert.NotEmpty(pedagogus.NevLabelek);
        Assert.NotEmpty(pedagogus.FejlesztesFormajaLabelek);
    }
}

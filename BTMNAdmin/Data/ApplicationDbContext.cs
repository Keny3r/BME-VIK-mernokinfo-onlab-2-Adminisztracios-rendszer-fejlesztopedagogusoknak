using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BTMNAdmin.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Fejlesztopedagogus> Fejlesztopedagogusok => Set<Fejlesztopedagogus>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder); // Az Identity konfigurációja miatt fontos.

        builder.Entity<Fejlesztopedagogus>(entity =>
        {
            entity.ToTable("Fejlesztopedagogusok");

            entity.Property(x => x.Nev)
                .HasMaxLength(150)
                .IsRequired();

            entity.HasIndex(x => x.ApplicationUserId).IsUnique();

            entity.HasOne(x => x.ApplicationUser)
                .WithOne()
                .HasForeignKey<Fejlesztopedagogus>(x => x.ApplicationUserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

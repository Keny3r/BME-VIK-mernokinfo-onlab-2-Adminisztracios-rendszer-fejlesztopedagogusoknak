using System.Linq.Expressions;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BTMNAdmin.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Fejlesztopedagogus> Fejlesztopedagogusok => Set<Fejlesztopedagogus>();
    public DbSet<Iskola> Iskolak => Set<Iskola>();
    public DbSet<Szakszolgalat> Szakszolgalatok => Set<Szakszolgalat>();
    public DbSet<Tanev> Tanevek => Set<Tanev>();
    public DbSet<FejlesztesiTerulet> FejlesztesiTeruletek => Set<FejlesztesiTerulet>();
    public DbSet<FejlesztesiCel> FejlesztesiCelok => Set<FejlesztesiCel>();
    public DbSet<FejlesztesiEszkoz> FejlesztesiEszkozok => Set<FejlesztesiEszkoz>();
    public DbSet<NevLabel> NevLabelek => Set<NevLabel>();
    public DbSet<AnyjaNeveLabel> AnyjaNeveLabelek => Set<AnyjaNeveLabel>();
    public DbSet<SzuletesiHelyEsIdoLabel> SzuletesiHelyEsIdoLabelek => Set<SzuletesiHelyEsIdoLabel>();
    public DbSet<ForgalmiSzamLabel> ForgalmiSzamLabelek => Set<ForgalmiSzamLabel>();
    public DbSet<IktatoszamLabel> IktatoszamLabelek => Set<IktatoszamLabel>();
    public DbSet<FejlesztesFormajaLabel> FejlesztesFormajaLabelek => Set<FejlesztesFormajaLabel>();

    private static void AddFejlesztoLabel<T>(
        ModelBuilder builder,
        string tableName,
        Expression<Func<Fejlesztopedagogus, IEnumerable<T>?>> fejlesztoListaja)
        where T : AbstractFejlesztoLabel
    {
        builder.Entity<T>(entity =>
        {
            entity.ToTable(tableName);

            entity.Property(x => x.Nev)
                .HasMaxLength(200)
                .IsRequired();
            
            entity.HasIndex(x => x.FejlesztopedagogusId);

            entity.HasOne(x => x.Fejlesztopedagogus)
                .WithMany(fejlesztoListaja)
                .HasForeignKey(x => x.FejlesztopedagogusId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void AddLabelLabel<TChild, TParent>(
        ModelBuilder builder,
        string tableName)
        where TChild : AbstractLabelLabel<TParent>
        where TParent : AbstractLabel
    {
        builder.Entity<TChild>(entity =>
        {
            entity.ToTable(tableName);

            entity.Property(x => x.Nev)
                .HasMaxLength(200)
                .IsRequired();

            entity.HasIndex(x => x.LabelId);

            entity.HasOne(x => x.Label)
                .WithMany()
                .HasForeignKey(x => x.LabelId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

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

        AddFejlesztoLabel(builder, "Iskolak", x => x.Iskolak);
        AddFejlesztoLabel(builder, "Szakszolgalatok", x => x.Szakszolgalatok);
        AddFejlesztoLabel(builder, "Tanevek", x => x.Tanevek);
        AddFejlesztoLabel(builder, "FejlesztesiTeruletek", x => x.FejlesztesiTeruletek);
        AddFejlesztoLabel(builder, "NevLabelek", x => x.NevLabelek);
        AddFejlesztoLabel(builder, "AnyjaNeveLabelek", x => x.AnyjaNeveLabelek);
        AddFejlesztoLabel(builder, "SzuletesiHelyEsIdoLabelek", x => x.SzuletesiHelyEsIdoLabelek);
        AddFejlesztoLabel(builder, "ForgalmiSzamLabelek", x => x.ForgalmiSzamLabelek);
        AddFejlesztoLabel(builder, "IktatoszamLabelek", x => x.IktatoszamLabelek);
        AddFejlesztoLabel(builder, "FejlesztesFormajaLabelek", x => x.FejlesztesFormajaLabelek);
        AddLabelLabel<FejlesztesiCel, FejlesztesiTerulet>(builder, "FejlesztesiCelok");
        AddLabelLabel<FejlesztesiEszkoz, FejlesztesiCel>(builder, "FejlesztesiEszkozok");
    }
}

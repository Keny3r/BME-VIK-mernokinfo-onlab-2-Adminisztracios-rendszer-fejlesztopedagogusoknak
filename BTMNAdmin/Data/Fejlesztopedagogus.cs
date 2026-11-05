namespace BTMNAdmin.Data;

public class Fejlesztopedagogus
{
    public int Id { get; set; }
    public string ApplicationUserId { get; set; } = null!;
    public ApplicationUser ApplicationUser { get; set; } = null!;
    public string Nev { get; set; } = null!;
    public int? ActiveIskola { get; set; } = null;
    public ICollection<Iskola> Iskolak { get; set; } = [];
    public int? ActiveSzakszolgalat { get; set; } = null;
    public ICollection<Szakszolgalat> Szakszolgalatok { get; set; } = [];
    public int? ActiveTanev { get; set; } = null;
    public ICollection<Tanev> Tanevek { get; set; } = [];
    public ICollection<FejlesztesiTerulet> FejlesztesiTeruletek { get; set; } = [];
    public ICollection<NevLabel> NevLabelek { get; set; } = [];
    public ICollection<AnyjaNeveLabel> AnyjaNeveLabelek { get; set; } = [];
    public ICollection<SzuletesiHelyEsIdoLabel> SzuletesiHelyEsIdoLabelek { get; set; } = [];
    public ICollection<ForgalmiSzamLabel> ForgalmiSzamLabelek { get; set; } = [];
    public ICollection<IktatoszamLabel> IktatoszamLabelek { get; set; } = [];
    public ICollection<FejlesztesFormajaLabel> FejlesztesFormajaLabelek { get; set; } = [];
}

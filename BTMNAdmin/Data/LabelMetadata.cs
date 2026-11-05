namespace BTMNAdmin.Data;

public sealed record LabelDescriptor(
    string Title,
    string SingularName,
    string AccusativeName,
    string EmptyText,
    string ModalTitleNew,
    string ModalTitleEdit,
    string ModalLabel,
    int MaxLength = 200,
    bool HasActive = true
);

public static class LabelMetadata
{
    private static readonly Dictionary<Type, LabelDescriptor> Descriptors = new()
    {
        [typeof(Tanev)] = new(
            Title: "Tanévek",
            SingularName: "tanév",
            AccusativeName: "tanévet",
            EmptyText: "Nincs tanév.",
            ModalTitleNew: "Új tanév",
            ModalTitleEdit: "Tanév szerkesztése",
            ModalLabel: "Tanév neve",
            MaxLength: 200
        ),
        [typeof(Iskola)] = new(
            Title: "Iskolák",
            SingularName: "iskola",
            AccusativeName: "iskolát",
            EmptyText: "Nincs Iskola.",
            ModalTitleNew: "Új iskola",
            ModalTitleEdit: "Iskola szerkesztése",
            ModalLabel: "Iskola neve",
            MaxLength: 200
        ),
        [typeof(Szakszolgalat)] = new(
            Title: "Szakszolgálatok",
            SingularName: "szakszolgálat",
            AccusativeName: "szakszolgálatot",
            EmptyText: "Nincs szakszolgálat.",
            ModalTitleNew: "Új szakszolgálat",
            ModalTitleEdit: "Szakszolgálat szerkesztése",
            ModalLabel: "Szakszolgálat neve",
            MaxLength: 200
        ),
        [typeof(NevLabel)] = new(
            Title: "Név",
            SingularName: "sorkezdet",
            AccusativeName: "sorkezdetet",
            EmptyText: "Nincs megadva sorkezdet a névhez.",
            ModalTitleNew: "Új sorkezdet (Név)",
            ModalTitleEdit: "Sorkezdet szerkesztése (Név)",
            ModalLabel: "Sorkezdő kifejezés",
            MaxLength: 200,
            HasActive: false
        ),
        [typeof(AnyjaNeveLabel)] = new(
            Title: "Anyja neve",
            SingularName: "sorkezdet",
            AccusativeName: "sorkezdetet",
            EmptyText: "Nincs megadva sorkezdet az anyja nevéhez.",
            ModalTitleNew: "Új sorkezdet (Anyja neve)",
            ModalTitleEdit: "Sorkezdet szerkesztése (Anyja neve)",
            ModalLabel: "Sorkezdő kifejezés",
            MaxLength: 200,
            HasActive: false
        ),
        [typeof(SzuletesiHelyEsIdoLabel)] = new(
            Title: "Születési helye és ideje",
            SingularName: "sorkezdet",
            AccusativeName: "sorkezdetet",
            EmptyText: "Nincs megadva sorkezdet a születési helyhez és időhöz.",
            ModalTitleNew: "Új sorkezdet (Születési helye és ideje)",
            ModalTitleEdit: "Sorkezdet szerkesztése (Születési helye és ideje)",
            ModalLabel: "Sorkezdő kifejezés",
            MaxLength: 200,
            HasActive: false
        ),
        [typeof(ForgalmiSzamLabel)] = new(
            Title: "Forgalmi szám",
            SingularName: "sorkezdet",
            AccusativeName: "sorkezdetet",
            EmptyText: "Nincs megadva sorkezdet a forgalmi számhoz.",
            ModalTitleNew: "Új sorkezdet (Forgalmi szám)",
            ModalTitleEdit: "Sorkezdet szerkesztése (Forgalmi szám)",
            ModalLabel: "Sorkezdő kifejezés",
            MaxLength: 200,
            HasActive: false
        ),
        [typeof(IktatoszamLabel)] = new(
            Title: "Iktatószám",
            SingularName: "sorkezdet",
            AccusativeName: "sorkezdetet",
            EmptyText: "Nincs megadva sorkezdet az iktatószámhoz.",
            ModalTitleNew: "Új sorkezdet (Iktatószám)",
            ModalTitleEdit: "Sorkezdet szerkesztése (Iktatószám)",
            ModalLabel: "Sorkezdő kifejezés",
            MaxLength: 200,
            HasActive: false
        ),
        [typeof(FejlesztesFormajaLabel)] = new(
            Title: "Fejlesztés formája",
            SingularName: "fejlesztési forma",
            AccusativeName: "fejlesztési formát",
            EmptyText: "Nincs megadva fejlesztési forma.",
            ModalTitleNew: "Új fejlesztési forma",
            ModalTitleEdit: "Fejlesztési forma szerkesztése",
            ModalLabel: "Fejlesztés formája",
            MaxLength: 200,
            HasActive: false
        )
    };

    public static readonly string[] DefaultNevLabelek =
    [
        "Név",
        "Gyermek neve",
        "Tanuló neve"
    ];

    public static readonly string[] DefaultAnyjaNeveLabelek =
    [
        "Anyja neve",
        "Anyja leánykori neve"
    ];

    public static readonly string[] DefaultSzuletesiHelyEsIdoLabelek =
    [
        "Születési helye és ideje",
        "Születési helye, ideje",
        "Születési hely és idő",
        "Születési hely, idő",
        "Születési idő és hely"
    ];

    public static readonly string[] DefaultForgalmiSzamLabelek =
    [
        "Forgalmi szám",
        "Forgalmi száma",
        "Forg. szám"
    ];

    public static readonly string[] DefaultIktatoszamLabelek =
    [
        "Iktatószám",
        "Iktatószáma",
        "Ikt. szám",
        "Ikt. sz."
    ];

    public static readonly string[] DefaultFejlesztesFormajaLabelek =
    [
        "egyéni",
        "csoportos"
    ];

    public static LabelDescriptor For<T>() where T : AbstractFejlesztoLabel =>
        Descriptors.TryGetValue(typeof(T), out var descriptor)
            ? descriptor
            : throw new InvalidOperationException($"Nincs regisztrált metaadat a(z) {typeof(T).Name} típushoz.");
}

namespace BTMNAdmin.Data;

public sealed record LabelDescriptor(
    string Title,
    string SingularName,
    string AccusativeName,
    string EmptyText,
    string ModalTitleNew,
    string ModalTitleEdit,
    string ModalLabel,
    int MaxLength = 200
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
        )
    };

    public static LabelDescriptor For<T>() where T : AbstractFejlesztoLabel =>
        Descriptors.TryGetValue(typeof(T), out var descriptor)
            ? descriptor
            : throw new InvalidOperationException($"Nincs regisztrált metaadat a(z) {typeof(T).Name} típushoz.");
}

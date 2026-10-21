namespace BTMNAdmin.Data;

public abstract class AbstractFejlesztoLabel: AbstractLabel
{
    public int FejlesztopedagogusId { get; set; }
    public Fejlesztopedagogus Fejlesztopedagogus { get; set; } = null!;
}
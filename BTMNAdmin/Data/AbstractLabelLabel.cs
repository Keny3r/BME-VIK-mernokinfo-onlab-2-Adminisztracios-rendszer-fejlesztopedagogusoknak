namespace BTMNAdmin.Data;

public abstract class AbstractLabelLabel<T>: AbstractLabel where T: AbstractLabel
{
    public int LabelId { get; set; }
    public T Label { get; set; } = null!;
}
namespace BTMNAdmin.Data;

public class Fejlesztopedagogus
{
    public int Id { get; set; }
    public string ApplicationUserId { get; set; } = null!;
    public ApplicationUser ApplicationUser { get; set; } = null!;
    public string Nev { get; set; } = null!;
}
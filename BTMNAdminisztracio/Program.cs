using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();

app.MapGet("/", () => "Hello, world!");

app.MapGet("/todos", async (AppDbContext db) =>
    await db.Todos.AsNoTracking().ToListAsync());

app.Run();

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<Todo> Todos => Set<Todo>();
}

public class Todo
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
}

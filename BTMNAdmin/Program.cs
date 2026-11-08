using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using BTMNAdmin.Api;
using BTMNAdmin.Components;
using BTMNAdmin.Components.Account;
using BTMNAdmin.Data;
using BTMNAdmin.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddCascadingAuthenticationState();
builder.Services.AddScoped<IdentityRedirectManager>();
builder.Services.AddScoped<AuthenticationStateProvider, IdentityRevalidatingAuthenticationStateProvider>();

builder.Services.AddAuthentication(options =>
    {
        options.DefaultScheme = IdentityConstants.ApplicationScheme;
        options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
    })
    .AddIdentityCookies();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddIdentityCore<ApplicationUser>(options =>
    {
        options.SignIn.RequireConfirmedAccount = true;
        options.Stores.SchemaVersion = IdentitySchemaVersions.Version3;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

builder.Services.AddSingleton<IEmailSender<ApplicationUser>, IdentityNoOpEmailSender>();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddDbContextFactory<ApplicationDbContext>(
    options => options.UseSqlServer(connectionString),
    ServiceLifetime.Scoped);

builder.Services.AddScoped<FejlesztopedagogusService>();
builder.Services.AddScoped<FejlesztesiFaService>();
builder.Services.AddScoped<RegistrationService>();

var llmBaseUrl = builder.Configuration.GetValue<string>("LlmService:BaseUrl") ?? "http://localhost:8000";
builder.Services.AddHttpClient<LlmService>(client =>
{
    client.BaseAddress = new Uri(llmBaseUrl);
    client.Timeout = TimeSpan.FromSeconds(35);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseHttpsRedirection();

app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

// Add additional endpoints required by the Identity /Account Razor components.
app.MapAdditionalIdentityEndpoints();

app.MapGet("/api/fejlesztesi-tervek/profil", ProfilAPI.GetProfilData)
    .RequireAuthorization();

app.MapGet("/api/fejlesztesi-tervek/beallitasok", BeallitasokAPI.GetBeallitasokData)
    .RequireAuthorization();

app.MapGet("/api/fejlesztesi-tervek/fejlesztesi-fa", FejlesztesiFaAPI.GetFejlesztesiFaData)
    .RequireAuthorization();

app.MapPost("/api/fejlesztesi-tervek/llm-extract", LLMServiceAPI.Extract)
    .RequireAuthorization();

// Automatikus adatbázis-migráció indításkor (SQL Server felállásának bevárásával)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    if (db.Database.IsRelational())
    {
        for (var attempt = 1; attempt <= 10; attempt++)
        {
            try
            {
                db.Database.Migrate();
                break;
            }
            catch (Exception) when (attempt < 10)
            {
                logger.LogWarning("Várakozás az adatbázis elérhetőségére... ({Attempt}/10)", attempt);
                Thread.Sleep(3000);
            }
        }
    }
}

var urls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? "http://*:5001";
app.Run(urls);

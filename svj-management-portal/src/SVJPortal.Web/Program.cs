using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SVJPortal.Web.Models.Interfaces;
using SVJPortal.Web.Data;
using SVJPortal.Web.Services;
using SVJPortal.Web.Models;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.StaticFiles;

var builder = WebApplication.CreateBuilder(args);

// Konfigurace pro containerizaci
builder.WebHost.UseUrls("http://0.0.0.0:3000");

// Konfigurace pro reverse proxy (Appwrite)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<IdentityUser>(options => 
{
    options.SignIn.RequireConfirmedAccount = false;
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
})
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddControllersWithViews();

// Register services
builder.Services.AddScoped<IPayrollService, PayrollService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IBankApiService, BankApiService>();
builder.Services.AddScoped<ISVJService, SVJService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IAuditService, AuditService>();

// Configure email settings
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

// Konfigurace pro produkční prostředí
if (app.Environment.IsProduction())
{
    app.UseForwardedHeaders();
}

app.UseHttpsRedirection();

// Respect PathBase when running behind reverse proxy (e.g., Appwrite)
var pathBase = app.Configuration["ASPNETCORE_PATHBASE"] ?? app.Configuration["PathBase"];
if (!string.IsNullOrWhiteSpace(pathBase))
{
    app.UsePathBase(pathBase);
}

var contentTypeProvider = new FileExtensionContentTypeProvider();
contentTypeProvider.Mappings[".svg"] = "image/svg+xml";
app.UseStaticFiles(new StaticFileOptions { ContentTypeProvider = contentTypeProvider });

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

// Favicon mapping to silence 404 in browsers
app.MapGet("/favicon.ico", (HttpContext ctx) => ctx.Response.Redirect("/favicon.svg"));

// Graceful status pages for 404/500 etc.
app.UseStatusCodePagesWithReExecute("/Home/Error");

// Konfigurace routingu
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// Specifické routy pro hlavní sekce
app.MapControllerRoute(
    name: "dashboard",
    pattern: "dashboard/{action=Index}/{id?}",
    defaults: new { controller = "Dashboard" });

app.MapControllerRoute(
    name: "svj",
    pattern: "svj/{action=Index}/{id?}",
    defaults: new { controller = "SVJ" });

app.MapControllerRoute(
    name: "employees",
    pattern: "employees/{action=Index}/{id?}",
    defaults: new { controller = "Employee" });

app.MapControllerRoute(
    name: "payroll",
    pattern: "payroll/{action=Index}/{id?}",
    defaults: new { controller = "Payroll" });

app.MapRazorPages();

// Fallback pro neznámé routy
app.MapFallbackToController("Index", "Home");

// Initialize roles and admin user
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        await SeedData.Initialize(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred seeding the DB.");
    }
}

app.Run();
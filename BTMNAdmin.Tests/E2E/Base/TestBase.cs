using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;

namespace BTMNAdmin.Tests.E2E.Base;

public abstract class TestBase : IDisposable
{
    protected readonly IWebDriver Driver;
    protected readonly string BaseUrl;

    protected TestBase()
    {
        BaseUrl = Environment.GetEnvironmentVariable("APP_BASE_URL") ?? "https://localhost:7147";

        var options = new ChromeOptions();
        var isHeadless = Environment.GetEnvironmentVariable("HEADLESS")?.Equals("true", StringComparison.OrdinalIgnoreCase) ?? false;
        if (isHeadless)
        {
            options.AddArgument("--headless=new");
        }
        options.AddArgument("--disable-gpu");
        options.AddArgument("--no-sandbox");
        options.AddArgument("--disable-dev-shm-usage");
        options.AddArgument("--window-size=1920,1080");
        options.AddArgument("--ignore-certificate-errors");

        Driver = new ChromeDriver(options);
        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(0);
    }

    public virtual void Dispose()
    {
        try
        {
            Driver.Quit();
        }
        catch
        {
            // Ignore teardown exceptions
        }
        finally
        {
            Driver.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}

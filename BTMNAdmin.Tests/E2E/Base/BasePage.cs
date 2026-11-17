using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace BTMNAdmin.Tests.E2E.Base;

public abstract class BasePage
{
    protected readonly IWebDriver Driver;
    protected readonly WebDriverWait Wait;

    protected BasePage(IWebDriver driver, TimeSpan? timeout = null)
    {
        Driver = driver;
        Wait = new WebDriverWait(driver, timeout ?? TimeSpan.FromSeconds(10));
    }

    public string CurrentUrl => Driver.Url;

    public string Title => Driver.Title;

    protected IWebElement WaitForElement(By locator)
    {
        return Wait.Until(d =>
        {
            var element = d.FindElement(locator);
            return element.Displayed ? element : null;
        })!;
    }

    protected IWebElement WaitForElementClickable(By locator)
    {
        return Wait.Until(d =>
        {
            var element = d.FindElement(locator);
            return (element.Displayed && element.Enabled) ? element : null;
        })!;
    }

    public bool WaitForUrlContains(string partialUrl, TimeSpan? timeout = null)
    {
        var wait = timeout.HasValue ? new WebDriverWait(Driver, timeout.Value) : Wait;
        return wait.Until(d => d.Url.Contains(partialUrl, StringComparison.OrdinalIgnoreCase));
    }
}

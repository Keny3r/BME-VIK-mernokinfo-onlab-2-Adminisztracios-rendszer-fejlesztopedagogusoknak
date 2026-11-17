using BTMNAdmin.Tests.E2E.Base;
using OpenQA.Selenium;

namespace BTMNAdmin.Tests.E2E.Pages;

public class ProfilePage(IWebDriver driver) : BasePage(driver)
{
    private static readonly By SubscriptionStatusBadge = By.CssSelector(".card-body span.badge");
    private static readonly By StartSubscriptionButton = By.XPath("//button[contains(., 'Előfizetés (')]");
    private static readonly By ManageSubscriptionButton = By.XPath("//button[contains(., 'Előfizetés kezelése és lemondás')]");
    private static readonly By Spinner = By.CssSelector(".spinner-border");
    private static readonly By ErrorAlert = By.CssSelector(".alert.alert-danger");
    private static readonly By ExpiryDateText = By.XPath("//p[contains(., 'Érvényes:')]");

    public ProfilePage NavigateTo(string baseUrl)
    {
        Driver.Navigate().GoToUrl($"{baseUrl.TrimEnd('/')}/profil");
        return this;
    }

    public string GetSubscriptionBadgeText()
    {
        return WaitForElement(SubscriptionStatusBadge).Text;
    }

    public bool IsProSubscriptionActive()
    {
        var badgeText = GetSubscriptionBadgeText();
        return badgeText.Contains("Pro Előfizetés", StringComparison.OrdinalIgnoreCase);
    }

    public void ClickStartSubscription()
    {
        WaitForElementClickable(StartSubscriptionButton).Click();
    }

    public void ClickManageSubscription()
    {
        WaitForElementClickable(ManageSubscriptionButton).Click();
    }

    public void WaitForProcessingToFinish()
    {
        Wait.Until(d => d.FindElements(Spinner).Count == 0);
    }

    public string? GetErrorMessage()
    {
        try
        {
            return WaitForElement(ErrorAlert).Text;
        }
        catch (WebDriverTimeoutException)
        {
            return null;
        }
    }

    public string? GetExpiryDateText()
    {
        try
        {
            return WaitForElement(ExpiryDateText).Text;
        }
        catch (WebDriverTimeoutException)
        {
            return null;
        }
    }
}

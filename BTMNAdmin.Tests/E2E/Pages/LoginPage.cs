using BTMNAdmin.Tests.E2E.Base;
using OpenQA.Selenium;

namespace BTMNAdmin.Tests.E2E.Pages;

public class LoginPage(IWebDriver driver) : BasePage(driver)
{
    private static readonly By EmailInput = By.Id("login-email");
    private static readonly By PasswordInput = By.Id("login-password");
    private static readonly By SubmitButton = By.CssSelector("button[type='submit']");
    private static readonly By ErrorAlert = By.CssSelector(".alert.alert-danger");

    public LoginPage NavigateTo(string baseUrl)
    {
        Driver.Navigate().GoToUrl($"{baseUrl.TrimEnd('/')}/Account/Login");
        WaitForElement(EmailInput);
        return this;
    }

    public LoginPage EnterEmail(string email)
    {
        var input = WaitForElement(EmailInput);
        input.Clear();
        input.SendKeys(email);
        return this;
    }

    public LoginPage EnterPassword(string password)
    {
        var input = WaitForElement(PasswordInput);
        input.Clear();
        input.SendKeys(password);
        return this;
    }

    public void ClickSubmit()
    {
        WaitForElementClickable(SubmitButton).Click();
    }

    public void Login(string email, string password)
    {
        EnterEmail(email);
        EnterPassword(password);
        ClickSubmit();
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
}

using BTMNAdmin.Tests.E2E.Base;
using OpenQA.Selenium;

namespace BTMNAdmin.Tests.E2E.Pages;

public class StripeCheckoutPage(IWebDriver driver) : BasePage(driver)
{
    private static readonly By CardNumberInput = By.Id("cardNumber");
    private static readonly By CardExpiryInput = By.Id("cardExpiry");
    private static readonly By CardCvcInput = By.Id("cardCvc");
    private static readonly By BillingNameInput = By.Id("billingName");
    private static readonly By SubmitButton = By.CssSelector("button[type='submit'], [data-testid='hosted-payment-submit-button']");
    private static readonly By BackOrCancelButton = By.CssSelector("a[aria-label*='Vissza'], a[aria-label*='Back'], [data-testid='back-button']");
    private static readonly By ErrorAlert = By.CssSelector("[role='alert'], .FieldError, .Payment-form-error");

    public bool WaitForStripeCheckoutLoaded(TimeSpan? timeout = null)
    {
        return WaitForUrlContains("checkout.stripe.com", timeout ?? TimeSpan.FromSeconds(15));
    }

    public StripeCheckoutPage EnterCardDetails(string cardNumber, string expiry, string cvc, string name = "Teszt Felhasználó")
    {
        if (Driver.FindElements(BillingNameInput).Count > 0)
        {
            Driver.FindElement(BillingNameInput).SendKeys(name);
        }

        WaitForElement(CardNumberInput).SendKeys(cardNumber);
        WaitForElement(CardExpiryInput).SendKeys(expiry);
        WaitForElement(CardCvcInput).SendKeys(cvc);

        return this;
    }

    public void ClickPay()
    {
        WaitForElementClickable(SubmitButton).Click();
    }

    public void ClickCancel()
    {
        WaitForElementClickable(BackOrCancelButton).Click();
    }

    public string? GetStripeErrorMessage()
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

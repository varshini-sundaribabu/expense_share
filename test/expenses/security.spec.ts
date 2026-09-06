import { test, expect } from "../fixtures/pages";
import { registerUser, uniqueEmail } from "../fixtures/user";
import { RegistrationPage } from "../pages/registration.page";
import { SignInPage } from "../pages/sign-in.page";

const expense = {
  description: "Private expense",
  amount: "120.00",
  currency: "USD",
  category: "Food",
  expenseDate: "2026-09-06",
};

test.describe("Expense authorization and privacy", () => {
  test("EX-SEC-001 prevents another user from viewing an expense @red @security", async ({ browser, registrationPage, expenseCreatePage }) => {
    test.fail();
    const owner = await registerUser(registrationPage, { email: uniqueEmail("owner") });
    await expenseCreatePage.create(expense);
    const ownerUrl = expenseCreatePage.page.url();
    await expenseCreatePage.page.context().close();
    const context = await browser.newContext();
    const page = await context.newPage();
    const secondRegistration = new RegistrationPage(page);
    const secondUser = await registerUser(secondRegistration, { email: uniqueEmail("viewer") });
    const signInPage = new SignInPage(page);
    await signInPage.signIn(secondUser.email, secondUser.password);
    await page.goto(ownerUrl);
    await expect(page.locator("p[role='alert']")).toContainText(/not authorized|forbidden|not found/i);
    await expect(page.getByText(expense.description)).not.toBeVisible();
    await context.close();
    expect(owner.email).toContain("@example.test");
  });

  test("EX-SEC-002 prevents another user from editing an expense @red @security", async ({ page }) => {
    test.fail();
    await page.goto("/expenses/owner-expense/edit");
    await expect(page.locator("p[role='alert']")).toContainText(/not authorized|forbidden/i);
  });

  test("EX-SEC-003 prevents unauthorized expense deletion @red @security", async ({ page }) => {
    test.fail();
    await page.goto("/expenses/owner-expense");
    await page.getByRole("button", { name: /delete expense/i }).click();
    await expect(page.locator("p[role='alert']")).toContainText(/not authorized|forbidden/i);
  });
});

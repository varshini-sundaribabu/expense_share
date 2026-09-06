import { test, expect } from "../fixtures/pages";
import { registerUser } from "../fixtures/user";
import { SignInPage } from "../pages/sign-in.page";

const expense = {
  description: "Persistent expense",
  amount: "120.00",
  currency: "USD",
  category: "Food",
  expenseDate: "2026-09-06",
};

test.describe("Expense persistence and atomicity", () => {
  test("EX-DATA-001 persists an expense after refresh @red @persistence", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    await expenseCreatePage.create(expense);
    await expenseCreatePage.page.reload();
    await expect(expenseCreatePage.page.getByText(expense.description)).toBeVisible();
    await expect(expenseCreatePage.page.getByText(expense.amount)).toBeVisible();
  });

  test("EX-DATA-002 persists an expense in a new browser session @red @persistence", async ({ browser, registrationPage, expenseCreatePage }) => {
    test.fail();
    const user = await registerUser(registrationPage);
    await expenseCreatePage.create(expense);
    await expenseCreatePage.page.context().close();
    const context = await browser.newContext();
    const page = await context.newPage();
    const signInPage = new SignInPage(page);
    await signInPage.signIn(user.email, user.password);
    await page.goto("/expenses");
    await expect(page.getByText(expense.description)).toBeVisible();
    await context.close();
  });

  test("EX-DATA-003 does not leave partial records after split validation failure @red", async ({ page, registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    await expenseCreatePage.create({ ...expense, splitType: "percentage", splitValues: ["60", "30"] });
    await expect(expenseCreatePage.alert).toContainText(/100|percent/i);
    const response = await page.request.get("/api/expenses");
    const expenses = response.ok() ? await response.json() : [];
    expect(JSON.stringify(expenses)).not.toContain(expense.description);
  });
});

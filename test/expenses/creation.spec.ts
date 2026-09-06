import { test, expect } from "../fixtures/pages";
import { registerUser } from "../fixtures/user";

const expense = {
  description: "Team dinner - unique test",
  amount: "120.00",
  currency: "USD",
  category: "Food",
  expenseDate: "2026-09-06",
};

async function openAuthenticatedExpenseForm(expenseCreatePage: { page: import("@playwright/test").Page }, registrationPage: Parameters<typeof registerUser>[0]) {
  await registerUser(registrationPage);
  await expenseCreatePage.page.goto("/expenses/new");
}

test.describe("Expense creation", () => {
  test("EX-CREATE-001 creates an expense with required fields @red @smoke", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await openAuthenticatedExpenseForm(expenseCreatePage, registrationPage);
    await expenseCreatePage.fillRequired(expense);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.status).toContainText(/created|saved/i);
  });

  test("EX-CREATE-002 stores an optional payment method @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    await expenseCreatePage.create({ ...expense, paymentMethod: "Credit card" });
    await expect(expenseCreatePage.status).toContainText(/created|saved/i);
    await expect(expenseCreatePage.page.getByText("Credit card")).toBeVisible();
  });

  test("EX-CREATE-003 creates an expense without payment method @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    await expenseCreatePage.create(expense);
    await expect(expenseCreatePage.status).toContainText(/created|saved/i);
  });

  test("EX-CREATE-004 prevents unauthenticated expense creation @red", async ({ page, expenseCreatePage }) => {
    test.fail();
    await expenseCreatePage.goto();
    await expect(page).toHaveURL(/sign-in|expenses\/new/);
    await expect(expenseCreatePage.submitButton).not.toBeVisible();
  });

  test("EX-CREATE-005 blocks deactivated users from creating expenses @red", async ({ registrationPage, profilePage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    await profilePage.goto();
    await profilePage.deactivate();
    await expenseCreatePage.goto();
    await expect(expenseCreatePage.alert).toContainText(/deactivated|not allowed/i);
  });

  test("EX-CREATE-006 prevents duplicate expense submission @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    await expenseCreatePage.fillRequired(expense);
    await expenseCreatePage.submitButton.dblclick();
    await expect(expenseCreatePage.status).toContainText(/created|saved/i);
  });

  test("EX-VAL-001 rejects a missing description @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    await expenseCreatePage.goto();
    await expenseCreatePage.amount.fill(expense.amount);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.alert).toContainText(/description/i);
  });

  test("EX-VAL-002 rejects a missing amount @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    await expenseCreatePage.goto();
    await expenseCreatePage.description.fill(expense.description);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.alert).toContainText(/amount/i);
  });

  test("EX-VAL-003 rejects zero and negative amounts @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    for (const amount of ["0", "-25.00"]) {
      await expenseCreatePage.goto();
      await expenseCreatePage.fillRequired({ ...expense, amount });
      await expenseCreatePage.submit();
      await expect(expenseCreatePage.alert).toContainText(/positive|amount/i);
    }
  });

  test("EX-VAL-004 accepts the smallest supported positive amount @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    await expenseCreatePage.create({ ...expense, amount: "0.01" });
    await expect(expenseCreatePage.status).toContainText(/created|saved/i);
  });

  test("EX-VAL-005 rejects unsupported amount precision @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    await expenseCreatePage.create({ ...expense, amount: "10.999" });
    await expect(expenseCreatePage.alert).toContainText(/precision|amount|decimal/i);
  });

  test("EX-VAL-006 rejects missing or unsupported currency @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    await expenseCreatePage.goto();
    await expenseCreatePage.fillRequired({ ...expense, currency: "XYZ" });
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.alert).toContainText(/currency/i);
  });

  test("EX-VAL-007 validates expense date boundaries @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    await expenseCreatePage.create({ ...expense, expenseDate: "2099-01-01" });
    await expect(expenseCreatePage.alert).toContainText(/date|future/i);
  });

  test("EX-VAL-008 enforces description and category length boundaries @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    await expenseCreatePage.create({ ...expense, description: "A".repeat(256) });
    await expect(expenseCreatePage.alert).toContainText(/length|characters|description/i);
  });

  test("EX-RES-001 recovers from storage failure without false success @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    await expenseCreatePage.page.route("**/api/expenses", (route) => route.abort("failed"));
    await expenseCreatePage.create(expense);
    await expect(expenseCreatePage.alert).toContainText(/unable|failed/i);
    await expect(expenseCreatePage.status).not.toBeVisible();
  });

  test("EX-A11Y-001 supports keyboard expense creation @red @a11y", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    await expenseCreatePage.goto();
    await expenseCreatePage.page.keyboard.press("Tab");
    await expect(expenseCreatePage.page.locator(":focus")).toHaveAccessibleName(/description/i);
  });

  test("EX-A11Y-002 associates expense errors with controls @red @a11y", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    await expenseCreatePage.goto();
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.page.getByRole("alert")).toBeVisible();
    await expect(expenseCreatePage.amount).toHaveAttribute("aria-invalid", "true");
  });
});

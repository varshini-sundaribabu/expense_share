import { test, expect } from "../fixtures/pages";
import { registerUser } from "../fixtures/user";

const expense = {
  description: "Split test expense",
  amount: "120.00",
  currency: "USD",
  category: "Food",
  expenseDate: "2026-09-06",
};

async function openSplitForm(expenseCreatePage: { page: import("@playwright/test").Page; goto: () => Promise<void> }, registrationPage: Parameters<typeof registerUser>[0]) {
  await registerUser(registrationPage);
  await expenseCreatePage.goto();
}

test.describe("Expense splitting", () => {
  test("EX-SPLIT-EQUAL-001 splits equally between two participants @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await openSplitForm(expenseCreatePage, registrationPage);
    await expenseCreatePage.fillRequired(expense);
    await expenseCreatePage.chooseSplit("equal");
    await expenseCreatePage.selectParticipants(["Alex Morgan", "Second User"]);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.page.getByText("60.00")).toHaveCount(2);
  });

  test("EX-SPLIT-EQUAL-002 splits equally between three participants @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await openSplitForm(expenseCreatePage, registrationPage);
    await expenseCreatePage.fillRequired(expense);
    await expenseCreatePage.chooseSplit("equal");
    await expenseCreatePage.selectParticipants(["Alex Morgan", "Second User", "Third User"]);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.page.getByText("40.00")).toHaveCount(3);
  });

  test("EX-SPLIT-EQUAL-003 handles equal-split rounding deterministically @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await openSplitForm(expenseCreatePage, registrationPage);
    await expenseCreatePage.fillRequired({ ...expense, amount: "100.00" });
    await expenseCreatePage.chooseSplit("equal");
    await expenseCreatePage.selectParticipants(["Alex Morgan", "Second User", "Third User"]);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.page.getByText(/remainder|rounding|33\.33|33\.34/i)).toBeVisible();
  });

  test("EX-SPLIT-EQUAL-004 recalculates shares when participants change @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await openSplitForm(expenseCreatePage, registrationPage);
    await expenseCreatePage.fillRequired(expense);
    await expenseCreatePage.chooseSplit("equal");
    await expenseCreatePage.selectParticipants(["Alex Morgan", "Second User"]);
    await expenseCreatePage.selectParticipants(["Third User"]);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.page.getByText(/40\.00|60\.00/i)).toBeVisible();
  });

  test("EX-SPLIT-PERCENT-001 accepts percentages totaling 100% @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await openSplitForm(expenseCreatePage, registrationPage);
    await expenseCreatePage.fillRequired(expense);
    await expenseCreatePage.chooseSplit("percentage");
    await expenseCreatePage.enterSplitValues(["50", "30", "20"]);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.status).toContainText(/created|saved/i);
  });

  test("EX-SPLIT-PERCENT-002 rejects percentages below 100% @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await openSplitForm(expenseCreatePage, registrationPage);
    await expenseCreatePage.fillRequired(expense);
    await expenseCreatePage.chooseSplit("percentage");
    await expenseCreatePage.enterSplitValues(["60", "30"]);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.alert).toContainText(/100|percent/i);
  });

  test("EX-SPLIT-PERCENT-003 rejects percentages above 100% @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await openSplitForm(expenseCreatePage, registrationPage);
    await expenseCreatePage.fillRequired(expense);
    await expenseCreatePage.chooseSplit("percentage");
    await expenseCreatePage.enterSplitValues(["70", "40"]);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.alert).toContainText(/100|percent/i);
  });

  test("EX-SPLIT-PERCENT-004 rejects invalid percentage values @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await openSplitForm(expenseCreatePage, registrationPage);
    await expenseCreatePage.fillRequired(expense);
    await expenseCreatePage.chooseSplit("percentage");
    await expenseCreatePage.enterSplitValues(["-10", "110"]);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.alert).toContainText(/percent|invalid/i);
  });

  test("EX-SPLIT-PERCENT-005 handles percentage rounding without changing the total @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await openSplitForm(expenseCreatePage, registrationPage);
    await expenseCreatePage.fillRequired({ ...expense, amount: "100.00" });
    await expenseCreatePage.chooseSplit("percentage");
    await expenseCreatePage.enterSplitValues(["33.33", "33.33", "33.34"]);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.page.getByText("100.00")).toBeVisible();
  });

  test("EX-SPLIT-FIXED-001 accepts fixed amounts totaling the expense @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await openSplitForm(expenseCreatePage, registrationPage);
    await expenseCreatePage.fillRequired(expense);
    await expenseCreatePage.chooseSplit("fixedAmount");
    await expenseCreatePage.enterSplitValues(["50.00", "30.00", "40.00"]);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.status).toContainText(/created|saved/i);
  });

  test("EX-SPLIT-FIXED-002 rejects fixed amounts below the expense @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await openSplitForm(expenseCreatePage, registrationPage);
    await expenseCreatePage.fillRequired(expense);
    await expenseCreatePage.chooseSplit("fixedAmount");
    await expenseCreatePage.enterSplitValues(["50.00", "50.00"]);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.alert).toContainText(/total|amount/i);
  });

  test("EX-SPLIT-FIXED-003 rejects fixed amounts above the expense @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await openSplitForm(expenseCreatePage, registrationPage);
    await expenseCreatePage.fillRequired(expense);
    await expenseCreatePage.chooseSplit("fixedAmount");
    await expenseCreatePage.enterSplitValues(["70.00", "70.00"]);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.alert).toContainText(/total|amount/i);
  });

  test("EX-SPLIT-FIXED-004 rejects negative fixed amounts @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await openSplitForm(expenseCreatePage, registrationPage);
    await expenseCreatePage.fillRequired(expense);
    await expenseCreatePage.chooseSplit("fixedAmount");
    await expenseCreatePage.enterSplitValues(["-10.00", "130.00"]);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.alert).toContainText(/positive|amount|invalid/i);
  });

  test("EX-SPLIT-FIXED-005 prevents duplicate fixed split entries @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await openSplitForm(expenseCreatePage, registrationPage);
    await expenseCreatePage.fillRequired(expense);
    await expenseCreatePage.chooseSplit("fixedAmount");
    await expenseCreatePage.enterSplitValues(["60.00", "60.00"]);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.alert).toContainText(/duplicate|participant/i);
  });
});

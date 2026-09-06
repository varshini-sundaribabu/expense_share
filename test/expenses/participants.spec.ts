import { test, expect } from "../fixtures/pages";
import { registerUser, uniqueEmail } from "../fixtures/user";
import { RegistrationPage } from "../pages/registration.page";

const expense = {
  description: "Participant test expense",
  amount: "120.00",
  currency: "USD",
  category: "Food",
  expenseDate: "2026-09-06",
};

async function createUserInContext(page: import("@playwright/test").Page, prefix: string) {
  const registrationPage = new RegistrationPage(page);
  return registerUser(registrationPage, { displayName: prefix, email: uniqueEmail(prefix.toLowerCase()) });
}

test.describe("Expense participants and payer", () => {
  test("EX-PART-001 allows the payer to be a participant @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    const user = await registerUser(registrationPage);
    await expenseCreatePage.create({ ...expense, payer: user.displayName, participants: [user.displayName] });
    await expect(expenseCreatePage.status).toContainText(/created|saved/i);
  });

  test("EX-PART-002 applies the payer-not-participant rule @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    const payer = await registerUser(registrationPage, { displayName: "Payer User" });
    await expenseCreatePage.create({ ...expense, payer: payer.displayName, participants: ["Other User"] });
    await expect(expenseCreatePage.alert).toContainText(/payer|participant/i);
  });

  test("EX-PART-003 rejects an unknown participant @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    await expenseCreatePage.create({ ...expense, participants: ["Unknown User"] });
    await expect(expenseCreatePage.alert).toContainText(/unknown|participant|user/i);
  });

  test("EX-PART-004 rejects a deactivated participant @red", async ({ browser, registrationPage, expenseCreatePage }) => {
    test.fail();
    await registerUser(registrationPage);
    const participantContext = await browser.newContext();
    const participantPage = await participantContext.newPage();
    const participant = await createUserInContext(participantPage, "Inactive User");
    await participantContext.close();
    await expenseCreatePage.create({ ...expense, participants: [participant.displayName] });
    await expect(expenseCreatePage.alert).toContainText(/deactivated|participant/i);
  });

  test("EX-PART-005 prevents duplicate participants @red", async ({ registrationPage, expenseCreatePage }) => {
    test.fail();
    const participant = await registerUser(registrationPage, { displayName: "Participant User" });
    await expenseCreatePage.goto();
    await expenseCreatePage.fillRequired(expense);
    await expenseCreatePage.selectParticipants([participant.displayName, participant.displayName]);
    await expenseCreatePage.submit();
    await expect(expenseCreatePage.alert).toContainText(/duplicate|participant/i);
  });
});

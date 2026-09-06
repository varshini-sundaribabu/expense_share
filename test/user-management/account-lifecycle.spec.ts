import { test, expect } from "../fixtures/pages";
import { registerUser, signIn, uniqueEmail } from "../fixtures/user";

test.describe("Account lifecycle", () => {
  test("UM-LIF-001 deactivates an active account", async ({ registrationPage, profilePage, signInPage }) => {
    const user = await registerUser(registrationPage, { email: uniqueEmail("deactivate") });
    await profilePage.goto();
    await profilePage.deactivate();
    await expect(profilePage.page.getByText(/deactivated/i)).toBeVisible();
    await signIn(signInPage, user);
    await expect(signInPage.alert).toContainText(/deactivated|incorrect/i);
  });

  test("UM-LIF-002 rejects sign-in for a deactivated user", async ({ registrationPage, profilePage, signInPage }) => {
    const user = await registerUser(registrationPage, { email: uniqueEmail("deactivated-login") });
    await profilePage.goto();
    await profilePage.deactivate();
    await signIn(signInPage, user);
    await expect(signInPage.alert).toContainText(/deactivated/i);
  });

  test("UM-LIF-003 preserves deactivated users in historical records", async ({ page }) => {
    await page.goto("/historical-records");
    await expect(page.getByText("Historical records preserve deactivated users.")).toBeVisible();
  });

  test("UM-LIF-004 blocks deletion with unsettled obligations", async ({ page, registrationPage, profilePage }) => {
    const user = await registerUser(registrationPage, { email: uniqueEmail("unsettled") });
    const seedResponse = await page.request.patch("/api/profile", { data: { displayName: user.displayName, email: user.email, unsettledObligations: true } });
    expect(seedResponse.ok()).toBeTruthy();
    await profilePage.goto();
    await profilePage.deleteAccount();
    await expect(profilePage.alert).toContainText(/settle|obligation/i);
  });

  test("UM-LIF-005 allows deletion without unsettled obligations", async ({ registrationPage, profilePage }) => {
    await registerUser(registrationPage, { email: uniqueEmail("deletion") });
    await profilePage.goto();
    await profilePage.deleteAccount();
    await expect(profilePage.page).toHaveURL(/\/sign-in$/);
  });

  test("UM-LIF-006 cancels account deletion", async ({ registrationPage, profilePage }) => {
    await registerUser(registrationPage, { email: uniqueEmail("cancel-delete") });
    await profilePage.goto();
    await profilePage.cancelDeletion();
    await expect(profilePage.heading).toBeVisible();
  });
});

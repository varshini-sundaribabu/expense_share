import { test, expect } from "../fixtures/pages";
import { registerUser, signIn, uniqueEmail } from "../fixtures/user";

test.describe("Account lifecycle", () => {
  test("UM-LIF-001 deactivates an active account @red", async ({ registrationPage, profilePage, signInPage }) => {
    test.fail();
    const user = await registerUser(registrationPage, { email: uniqueEmail("deactivate") });
    await profilePage.goto();
    await profilePage.deactivate();
    await expect(profilePage.page.getByText(/deactivated/i)).toBeVisible();
    await signIn(signInPage, user);
    await expect(signInPage.alert).toContainText(/deactivated/i);
  });

  test("UM-LIF-002 rejects sign-in for a deactivated user @red", async ({ registrationPage, profilePage, signInPage }) => {
    test.fail();
    const user = await registerUser(registrationPage, { email: uniqueEmail("deactivated-login") });
    await profilePage.goto();
    await profilePage.deactivate();
    await signIn(signInPage, user);
    await expect(signInPage.alert).toContainText(/deactivated/i);
  });

  test("UM-LIF-003 preserves deactivated users in historical records @red", async ({ page }) => {
    test.fail();
    await page.goto("/historical-records");
    await expect(page.getByText(/deactivated user|historical/i)).toBeVisible();
  });

  test("UM-LIF-004 blocks deletion with unsettled obligations @red", async ({ profilePage }) => {
    test.fail();
    await profilePage.goto();
    await profilePage.deleteAccount();
    await expect(profilePage.alert).toContainText(/settle|obligation/i);
  });

  test("UM-LIF-005 allows deletion without unsettled obligations @red", async ({ profilePage }) => {
    test.fail();
    await profilePage.deleteAccount();
    await expect(profilePage.page).toHaveURL(/\/sign-in$/);
  });

  test("UM-LIF-006 cancels account deletion @red", async ({ profilePage }) => {
    test.fail();
    await profilePage.cancelDeletion();
    await expect(profilePage.heading).toBeVisible();
  });
});

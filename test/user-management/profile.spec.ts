import { test, expect } from "../fixtures/pages";
import { registerUser, uniqueEmail } from "../fixtures/user";

test.describe("User profile", () => {
  test("UM-PRO-001 displays the authenticated user's profile", async ({ registrationPage, profilePage }) => {
    const user = await registerUser(registrationPage, { email: uniqueEmail("profile") });
    await profilePage.openFromRegistration();
    await expect(profilePage.heading).toBeVisible();
    await expect(profilePage.displayName).toHaveValue(user.displayName);
    await expect(profilePage.email).toHaveValue(user.email);
    await expect(profilePage.page.getByText(user.password)).not.toBeVisible();
  });

  test("UM-PRO-002 updates the display name", async ({ registrationPage, profilePage }) => {
    await registerUser(registrationPage, { email: uniqueEmail("display-update") });
    await profilePage.goto();
    await profilePage.updateDisplayName("Updated Morgan");
    await expect(profilePage.displayName).toHaveValue("Updated Morgan");
  });

  test("UM-PRO-003 updates optional profile fields", async ({ registrationPage, profilePage }) => {
    await registerUser(registrationPage, { email: uniqueEmail("optional-update") });
    await profilePage.goto();
    await profilePage.updateOptionalFields("+1 202 555 0147", "42 Example Street, Test City");
    await expect(profilePage.address).toHaveValue("42 Example Street, Test City");
  });

  test("UM-PRO-004 rejects invalid profile updates", async ({ registrationPage, profilePage }) => {
    await registerUser(registrationPage, { email: uniqueEmail("invalid-update") });
    await profilePage.goto();
    await profilePage.email.fill("invalid-email");
    await profilePage.saveButton.click();
    await expect(profilePage.alert).toBeVisible();
  });

  test("UM-PRO-005 rejects changing email to another user's email", async ({ registrationPage, profilePage }) => {
    const firstUser = await registerUser(registrationPage, { email: uniqueEmail("profile-a") });
    await profilePage.page.context().clearCookies();
    const secondUser = await registerUser(registrationPage, { email: uniqueEmail("profile-b") });
    await profilePage.goto();
    await profilePage.email.fill(firstUser.email);
    await profilePage.saveButton.click();
    await expect(profilePage.alert).toContainText(/already exists/i);
    await expect(profilePage.page.getByText(secondUser.email)).toBeVisible();
  });
});

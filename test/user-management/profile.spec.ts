import { test, expect } from "../fixtures/pages";
import { registerUser, uniqueEmail } from "../fixtures/user";

test.describe("User profile", () => {
  test("UM-PRO-001 displays the authenticated user's profile", async ({ registrationPage, profilePage }) => {
    const user = await registerUser(registrationPage, { email: uniqueEmail("profile") });
    await profilePage.openFromRegistration();
    await expect(profilePage.heading).toBeVisible();
    await expect(profilePage.page.getByText(user.displayName)).toBeVisible();
    await expect(profilePage.page.getByText(user.email)).toBeVisible();
    await expect(profilePage.page.getByText(user.password)).not.toBeVisible();
  });

  test("UM-PRO-002 updates the display name @red", async ({ registrationPage, profilePage }) => {
    test.fail();
    await registerUser(registrationPage, { email: uniqueEmail("display-update") });
    await profilePage.goto();
    await profilePage.updateDisplayName("Updated Morgan");
    await expect(profilePage.page.getByText("Updated Morgan")).toBeVisible();
  });

  test("UM-PRO-003 updates optional profile fields @red", async ({ registrationPage, profilePage }) => {
    test.fail();
    await registerUser(registrationPage, { email: uniqueEmail("optional-update") });
    await profilePage.goto();
    await profilePage.updateOptionalFields("+1 202 555 0147", "42 Example Street, Test City");
    await expect(profilePage.page.getByText("42 Example Street, Test City")).toBeVisible();
  });

  test("UM-PRO-004 rejects invalid profile updates @red", async ({ registrationPage, profilePage }) => {
    test.fail();
    await registerUser(registrationPage, { email: uniqueEmail("invalid-update") });
    await profilePage.goto();
    await profilePage.email.fill("invalid-email");
    await profilePage.saveButton.click();
    await expect(profilePage.alert).toBeVisible();
  });

  test("UM-PRO-005 rejects changing email to another user's email @red", async ({ registrationPage, profilePage }) => {
    test.fail();
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

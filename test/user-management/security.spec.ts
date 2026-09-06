import { test, expect } from "../fixtures/pages";
import { registerUser, signIn, uniqueEmail, validPassword } from "../fixtures/user";

test.describe("Authentication, authorization, and privacy", () => {
  test("UM-AUTH-001 signs in with valid credentials @smoke", async ({ page, registrationPage, signInPage }) => {
    const user = await registerUser(registrationPage, { email: uniqueEmail("auth") });
    await signIn(signInPage, user);
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByText(user.email)).toBeVisible();
  });

  test("UM-AUTH-002 rejects an invalid password", async ({ registrationPage, signInPage }) => {
    const user = await registerUser(registrationPage, { email: uniqueEmail("invalid-password") });
    await signInPage.goto();
    await signInPage.fillCredentials(user.email, "wrongpass1$");
    await signInPage.submit();
    await expect(signInPage.alert).toContainText(/incorrect/i);
  });

  test("UM-AUTH-003 masks passwords and omits them from profile UI", async ({ page, registrationPage, signInPage }) => {
    const user = await registerUser(registrationPage, { email: uniqueEmail("privacy-ui") });
    await signInPage.goto();
    await expect(signInPage.password).toHaveAttribute("type", "password");
    await signIn(signInPage, user);
    await expect(page.getByText(validPassword)).not.toBeVisible();
  });

  test("UM-AUTH-004 does not expose credentials in client responses", async ({ page }) => {
    const password = validPassword;
    const response = await page.request.post("/api/register", {
      data: { displayName: "Response Check", email: uniqueEmail("response"), password },
    });
    const body = JSON.stringify(await response.json());
    expect(body).not.toContain(password);
    expect(body).not.toContain("passwordHash");
    expect(body).not.toContain("password_hash");
  });

  test("UM-AUTH-005 blocks protected access after sign-out @red @security", async ({ page, registrationPage, signInPage, profilePage }) => {
    test.fail();
    const user = await registerUser(registrationPage, { email: uniqueEmail("sign-out") });
    await signIn(signInPage, user);
    await profilePage.signOut();
    await profilePage.goto();
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test("UM-SEC-001 rejects unauthenticated profile access", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test("UM-SEC-002 prevents user A from editing user B @red @security", async ({ page }) => {
    test.fail();
    await page.goto("/profile/user-b");
    await expect(page.getByRole("alert")).toContainText(/not authorized|forbidden/i);
  });

  test("UM-SEC-003 keeps credentials out of URLs and browser storage", async ({ page, registrationPage }) => {
    const user = await registerUser(registrationPage, { email: uniqueEmail("storage") });
    await expect(page).not.toHaveURL(new RegExp(encodeURIComponent(user.password)));
    const storage = await page.evaluate(() => JSON.stringify({ localStorage, sessionStorage }));
    expect(storage).not.toContain(user.password);
  });

  test("UM-SEC-004 handles an expired session safely @security", async ({ page, registrationPage, signInPage }) => {
    const user = await registerUser(registrationPage, { email: uniqueEmail("expired") });
    await signIn(signInPage, user);
    await page.context().clearCookies();
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/sign-in$/);
  });
});

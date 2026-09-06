import { test, expect } from "../fixtures/pages";
import { registerUser, uniqueEmail, validPassword } from "../fixtures/user";
import { RegistrationPage } from "../pages/registration.page";
import { SignInPage } from "../pages/sign-in.page";

test.describe("User persistence", () => {
  test("UM-PER-001 persists a newly created user after refresh @persistence", async ({ registrationPage, profilePage }) => {
    const email = uniqueEmail();
    await registerUser(registrationPage, { email });
    await registrationPage.page.reload();
    await profilePage.goto();
    await expect(profilePage.page.getByText(email)).toBeVisible();
  });

  test("UM-PER-002 persists a user in a new browser session @persistence", async ({ browser, registrationPage, page }) => {
    const email = uniqueEmail();
    await registerUser(registrationPage, { email });
    await page.context().close();

    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    const secondSignInPage = new SignInPage(secondPage);
    await secondSignInPage.signIn(email, validPassword);
    await expect(secondPage.getByText(email)).toBeVisible();
    await secondContext.close();
  });

  test("UM-PER-003 does not create duplicates on repeated submission @persistence", async ({ registrationPage }) => {
    const email = uniqueEmail("duplicate-submit");
    await registerUser(registrationPage, { email });
    await registrationPage.goto();
    await registrationPage.fillRequired("Alex Morgan", email, validPassword);
    await registrationPage.submit();
    await expect(registrationPage.alert).toContainText(/already exists/i);
  });

  test("UM-PER-004 preserves profile changes across a new session @persistence", async ({ browser, registrationPage, profilePage, page }) => {
    const user = await registerUser(registrationPage, { email: uniqueEmail("profile-persist") });
    await profilePage.openFromRegistration();
    await expect(page.getByText(user.email)).toBeVisible();
    const context = await browser.newContext();
    const secondPage = await context.newPage();
    const secondSignInPage = new SignInPage(secondPage);
    await secondSignInPage.signIn(user.email, user.password);
    await expect(secondPage.getByText(user.email)).toBeVisible();
    await context.close();
  });

  test("UM-PER-005 isolates private data between users @security", async ({ browser }) => {
    const firstContext = await browser.newContext();
    const firstPage = await firstContext.newPage();
    const firstUser = await registerUser(new RegistrationPage(firstPage), { email: uniqueEmail("isolated-a") });
    await firstContext.close();
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    const secondUser = await registerUser(new RegistrationPage(secondPage), { email: uniqueEmail("isolated-b") });
    await secondPage.goto("/profile");
    await expect(secondPage.getByText(firstUser.email)).not.toBeVisible();
    await expect(secondPage.getByText(secondUser.email)).toBeVisible();
    await secondContext.close();
  });
});

import { test, expect } from "../fixtures/pages";
import { uniqueEmail, validPassword } from "../fixtures/user";

test.describe("User registration", () => {
  test("UM-REG-001 registers with required fields @smoke", async ({ registrationPage }) => {
    await registrationPage.register("Alex Morgan", uniqueEmail(), validPassword);
    await expect(registrationPage.page.getByText(/account created|welcome/i)).toBeVisible();
  });

  test("UM-VAL-001 rejects a missing display name", async ({ registrationPage }) => {
    await registrationPage.goto();
    await registrationPage.email.fill(uniqueEmail());
    await registrationPage.password.fill(validPassword);
    await registrationPage.submit();
    await expect(registrationPage.page.getByText(/display name is required/i)).toBeVisible();
  });

  test("UM-VAL-002 rejects a missing email", async ({ registrationPage }) => {
    await registrationPage.goto();
    await registrationPage.displayName.fill("Alex Morgan");
    await registrationPage.password.fill(validPassword);
    await registrationPage.submit();
    await expect(registrationPage.page.getByText(/email is required/i)).toBeVisible();
  });

  test("UM-VAL-003 rejects a missing password", async ({ registrationPage }) => {
    await registrationPage.goto();
    await registrationPage.displayName.fill("Alex Morgan");
    await registrationPage.email.fill(uniqueEmail());
    await registrationPage.submit();
    await expect(registrationPage.page.getByText(/password is required/i)).toBeVisible();
  });

  test("UM-VAL-005 rejects a password without the required mix", async ({ registrationPage }) => {
    await registrationPage.goto();
    await registrationPage.fillRequired("Alex Morgan", uniqueEmail(), "password");
    await registrationPage.submit();
    await expect(registrationPage.page.getByText(/8 characters.*lowercase.*number.*\$.*@.*_/i)).toBeVisible();
  });

  test("UM-VAL-006 accepts the 8-character password boundary", async ({ registrationPage }) => {
    await registrationPage.register("Alex Morgan", uniqueEmail(), "abcde1$_");
    await expect(registrationPage.page.getByText(/account created|welcome/i)).toBeVisible();
  });

  test("UM-REG-002 stores optional phone and address fields @red", async ({ registrationPage, profilePage }) => {
    test.fail();
    await registrationPage.goto();
    await registrationPage.fillRequired("Alex Morgan", uniqueEmail(), validPassword);
    await registrationPage.fillOptional("+1 202 555 0147", "42 Example Street, Test City");
    await registrationPage.submitAndWaitForSuccess();
    await profilePage.openFromRegistration();
    await expect(profilePage.page.getByText("+1 202 555 0147")).toBeVisible();
    await expect(profilePage.page.getByText("42 Example Street, Test City")).toBeVisible();
  });

  test("UM-REG-003 allows blank optional profile fields", async ({ registrationPage }) => {
    await registrationPage.register("Alex Morgan", uniqueEmail(), validPassword);
  });

  test("UM-REG-004 rejects an existing email", async ({ registrationPage }) => {
    const email = uniqueEmail("duplicate");
    await registrationPage.register("First User", email, validPassword);
    await registrationPage.goto();
    await registrationPage.fillRequired("Second User", email, validPassword);
    await registrationPage.submit();
    await expect(registrationPage.alert).toContainText(/already exists/i);
  });

  test("UM-REG-005 normalizes duplicate email casing and whitespace", async ({ registrationPage }) => {
    const email = uniqueEmail("normalized");
    await registrationPage.register("First User", email, validPassword);
    await registrationPage.goto();
    await registrationPage.fillRequired("Second User", ` ${email.toUpperCase()} `, validPassword);
    await registrationPage.submit();
    await expect(registrationPage.alert).toContainText(/already exists/i);
  });

  test("UM-VAL-004 rejects malformed email addresses @red", async ({ registrationPage }) => {
    test.fail();
    await registrationPage.goto();
    await registrationPage.fillRequired("Alex Morgan", "alex.example.test", validPassword);
    await registrationPage.submit();
    await expect(registrationPage.alert).toContainText(/valid email|email/i);
  });

  test("UM-VAL-007 rejects whitespace-only required values @red", async ({ registrationPage }) => {
    test.fail();
    await registrationPage.goto();
    await registrationPage.fillRequired("   ", "   ", "   ");
    await registrationPage.submit();
    await expect(registrationPage.alert).toBeVisible();
  });

  test("UM-VAL-008 enforces documented field length boundaries @red", async ({ registrationPage }) => {
    test.fail();
    await registrationPage.goto();
    await registrationPage.fillRequired("A".repeat(101), uniqueEmail(), validPassword);
    await registrationPage.submit();
    await expect(registrationPage.alert).toContainText(/length|characters|invalid/i);
  });

  test("UM-A11Y-001 supports keyboard registration", async ({ registrationPage }) => {
    await registrationPage.goto();
    await registrationPage.page.keyboard.press("Tab");
    await expect(registrationPage.page.locator(":focus")).toHaveAccessibleName(/display name/i);
    await registrationPage.page.keyboard.type("Alex Morgan");
    await registrationPage.page.keyboard.press("Tab");
    await registrationPage.page.keyboard.type(uniqueEmail("keyboard"));
    await registrationPage.page.keyboard.press("Tab");
    await registrationPage.page.keyboard.type(validPassword);
    await registrationPage.page.keyboard.press("Tab");
    await expect(registrationPage.page.locator(":focus")).toHaveRole("button");
  });

  test("UM-A11Y-002 associates validation errors with form fields @red @a11y", async ({ registrationPage }) => {
    test.fail();
    await registrationPage.goto();
    await registrationPage.submit();
    await expect(registrationPage.displayName).toHaveAttribute("aria-invalid", "true");
    await expect(registrationPage.page.getByRole("alert")).toBeVisible();
  });

  test("UM-RES-001 preserves valid values after a validation error", async ({ registrationPage }) => {
    const email = uniqueEmail("recover");
    await registrationPage.goto();
    await registrationPage.fillRequired("Alex Morgan", email, "password");
    await registrationPage.submit();
    await expect(registrationPage.alert).toBeVisible();
    await expect(registrationPage.displayName).toHaveValue("Alex Morgan");
    await expect(registrationPage.email).toHaveValue(email);
  });

  test("UM-RES-002 shows failure without false success when storage fails @red", async ({ registrationPage }) => {
    test.fail();
    await registrationPage.page.route("**/api/register", (route) => route.abort("failed"));
    await registrationPage.goto();
    await registrationPage.fillRequired("Alex Morgan", uniqueEmail("storage-failure"), validPassword);
    await registrationPage.submit();
    await expect(registrationPage.alert).toContainText(/unable to create/i);
    await expect(registrationPage.status).not.toBeVisible();
  });

  test("UM-RES-003 prevents duplicate submission while pending", async ({ registrationPage }) => {
    await registrationPage.goto();
    await registrationPage.fillRequired("Alex Morgan", uniqueEmail("pending"), validPassword);
    await registrationPage.submitButton.dblclick();
    await expect(registrationPage.status).toContainText("Account created");
  });
});

import { expect, type Locator, type Page } from "@playwright/test";

export class RegistrationPage {
  readonly page: Page;
  readonly displayName: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly phoneNumber: Locator;
  readonly address: Locator;
  readonly submitButton: Locator;
  readonly alert: Locator;
  readonly status: Locator;
  readonly viewProfileLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.displayName = page.getByLabel("Display name");
    this.email = page.getByLabel("Email");
    this.password = page.getByLabel("Password");
    this.phoneNumber = page.getByLabel("Phone number");
    this.address = page.getByLabel("Address");
    this.submitButton = page.getByRole("button", { name: /create account|register|sign up/i });
    this.alert = page.locator("p[role='alert']");
    this.status = page.getByRole("status");
    this.viewProfileLink = page.getByRole("link", { name: /view profile/i });
  }

  async goto() {
    await this.page.goto("/register");
  }

  async fillRequired(displayName: string, email: string, password: string) {
    await this.displayName.fill(displayName);
    await this.email.fill(email);
    await this.password.fill(password);
  }

  async fillOptional(phoneNumber: string, address: string) {
    await this.phoneNumber.fill(phoneNumber);
    await this.address.fill(address);
  }

  async submit() {
    await this.submitButton.click();
  }

  async submitAndWaitForSuccess() {
    await this.submit();
    await expect(this.status).toContainText("Account created");
  }

  async register(displayName: string, email: string, password: string) {
    await this.goto();
    await this.fillRequired(displayName, email, password);
    await this.submitAndWaitForSuccess();
  }
}

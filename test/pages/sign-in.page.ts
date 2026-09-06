import { type Locator, type Page } from "@playwright/test";

export class SignInPage {
  readonly page: Page;
  readonly email: Locator;
  readonly password: Locator;
  readonly submitButton: Locator;
  readonly alert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = page.getByLabel("Email");
    this.password = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: /sign in|log in/i });
    this.alert = page.locator("p[role='alert']");
  }

  async goto() {
    await this.page.goto("/sign-in");
  }

  async fillCredentials(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async signIn(email: string, password: string) {
    await this.goto();
    await this.fillCredentials(email, password);
    await this.submit();
  }
}

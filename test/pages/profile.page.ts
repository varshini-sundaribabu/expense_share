import { type Locator, type Page } from "@playwright/test";

export class ProfilePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly displayName: Locator;
  readonly email: Locator;
  readonly phoneNumber: Locator;
  readonly address: Locator;
  readonly saveButton: Locator;
  readonly signOutButton: Locator;
  readonly deactivateButton: Locator;
  readonly deleteButton: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;
  readonly alert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: /your profile/i });
    this.displayName = page.getByLabel("Display name");
    this.email = page.getByLabel("Email");
    this.phoneNumber = page.getByLabel("Phone number");
    this.address = page.getByLabel("Address");
    this.saveButton = page.getByRole("button", { name: /save/i });
    this.signOutButton = page.getByRole("button", { name: /sign out/i });
    this.deactivateButton = page.getByRole("button", { name: /deactivate account/i });
    this.deleteButton = page.getByRole("button", { name: /delete account/i });
    this.confirmButton = page.getByRole("button", { name: /confirm/i });
    this.cancelButton = page.getByRole("button", { name: /cancel/i });
    this.alert = page.locator("p[role='alert']");
  }

  async goto() {
    await this.page.goto("/profile");
  }

  async openFromRegistration() {
    await this.page.getByRole("link", { name: /view profile/i }).click();
  }

  async updateDisplayName(displayName: string) {
    await this.displayName.fill(displayName);
    await this.saveButton.click();
  }

  async updateOptionalFields(phoneNumber: string, address: string) {
    await this.phoneNumber.fill(phoneNumber);
    await this.address.fill(address);
    await this.saveButton.click();
  }

  async signOut() {
    await this.signOutButton.click();
  }

  async deactivate() {
    await this.deactivateButton.click();
    await this.page.getByRole("button", { name: /confirm/i }).click();
  }

  async deleteAccount() {
    await this.deleteButton.click();
    await this.confirmButton.click();
  }

  async cancelDeletion() {
    await this.deleteButton.click();
    await this.cancelButton.click();
  }
}

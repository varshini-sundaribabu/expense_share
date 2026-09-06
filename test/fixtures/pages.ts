/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from "@playwright/test";
import { ProfilePage } from "../pages/profile.page";
import { RegistrationPage } from "../pages/registration.page";
import { SignInPage } from "../pages/sign-in.page";
import { ExpenseCreatePage } from "../pages/expense-create.page";

type PageObjects = {
  registrationPage: RegistrationPage;
  signInPage: SignInPage;
  profilePage: ProfilePage;
  expenseCreatePage: ExpenseCreatePage;
};

export const test = base.extend<PageObjects>({
  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },
  signInPage: async ({ page }, use) => {
    await use(new SignInPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
  expenseCreatePage: async ({ page }, use) => {
    await use(new ExpenseCreatePage(page));
  },
});

export { expect } from "@playwright/test";

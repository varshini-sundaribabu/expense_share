import { RegistrationPage } from "../pages/registration.page";
import { SignInPage } from "../pages/sign-in.page";

export const validPassword = "expense1$";

export function uniqueEmail(prefix = "user") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`;
}

export async function registerUser(registrationPage: RegistrationPage, options: { displayName?: string; email?: string; password?: string } = {}) {
  const user = {
    displayName: options.displayName ?? "Alex Morgan",
    email: options.email ?? uniqueEmail(),
    password: options.password ?? validPassword,
  };

  await registrationPage.register(user.displayName, user.email, user.password);
  return user;
}

export async function signIn(signInPage: SignInPage, user: { email: string; password: string }) {
  await signInPage.signIn(user.email, user.password);
}

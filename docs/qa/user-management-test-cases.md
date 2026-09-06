# User Management Test Cases

## Purpose

This document contains the manual QA cases for creating and storing users, viewing and updating profiles, authentication and privacy, account status changes, and persistence. It is the review source for the future Playwright tests.

## Product Rules Under Test

These rules are the assumptions under test and must be approved before automation is finalized:

- Required registration fields are `displayName`, `email`, and `password`.
- `phoneNumber` and `address` are optional profile fields.
- Email uniqueness is case-insensitive and ignores accidental leading or trailing whitespace.
- Passwords must contain at least 8 characters, at least one lowercase letter, at least one number, and at least one of these symbols: `$`, `@`, or `_`.
- Passwords must never be displayed, returned in profile data, or stored as plaintext.
- A successful registration creates one active user and does not create duplicates on refresh or retry.
- User data must persist after page refresh and when the user signs in from a new browser session.
- Deactivated users remain in historical records but cannot sign in or create new activity.
- Account deletion is blocked when the user has unsettled obligations.
- Account deletion is allowed when the user has no unsettled obligations. The resulting retention or anonymization behavior must be selected during implementation review.
- Users can view and update only their own profile unless an administrator capability is explicitly added later.
- Error messages must be understandable, must not expose secrets, and must not reveal whether sensitive account data exists beyond the approved product behavior.

## Test Data Conventions

Use unique data for each create-user test unless the case explicitly tests duplication.

| Data | Example |
|---|---|
| Valid display name | `Alex Morgan` |
| Valid email | `alex.<unique-id>@example.test` |
| Equivalent duplicate email | ` ALEX.<unique-id>@EXAMPLE.TEST ` |
| Valid password | `expense1$` or another value meeting the approved strength rule |
| Optional phone | `+1 202 555 0147` |
| Optional address | `42 Example Street, Test City` |
| Oversized value | A value longer than the documented maximum |
| Invalid email | `alex.example.test` |
| Whitespace-only value | A string containing spaces only |

Never use real personal information or production credentials. Test users must be isolated and removed after execution where the environment allows it.

## Manual Case Format

Each case contains a stable ID, priority, type, preconditions, data, steps, expected result, automation mapping, and review status.

---

## Registration And User Creation

### UM-REG-001: Register with required fields

- **Priority:** P0
- **Type:** Positive, smoke, end-to-end
- **Preconditions:** Registration is available; the email is not already registered.
- **Test data:** Valid display name, unique email, valid password.
- **Steps:**
  1. Open the registration page.
  2. Enter the display name, email, and password.
  3. Submit the form.
- **Expected result:** Registration succeeds. The user is stored as an active account, receives the expected success state, and is redirected according to the approved product flow. No duplicate account is created.
- **Playwright mapping:** `test/user-management/registration.spec.ts`
- **Review status:** Proposed

### UM-REG-002: Register with optional profile fields

- **Priority:** P1
- **Type:** Positive, data integrity
- **Preconditions:** Registration is available; the email is not already registered.
- **Test data:** Valid required fields plus phone number and address.
- **Steps:**
  1. Complete registration with all supported profile fields.
  2. Submit the form.
  3. Open the newly created profile.
- **Expected result:** Registration succeeds and the optional phone number and address are stored exactly as approved, subject to documented normalization.
- **Playwright mapping:** `test/user-management/registration.spec.ts`
- **Review status:** Proposed

### UM-REG-003: Register without optional profile fields

- **Priority:** P1
- **Type:** Positive, boundary
- **Preconditions:** Registration is available; the email is not already registered.
- **Test data:** Valid display name, email, and password; blank phone and address.
- **Steps:**
  1. Leave phone number and address blank.
  2. Complete the required fields.
  3. Submit the form.
- **Expected result:** Registration succeeds. Blank optional fields are stored as empty or null according to the API contract, without blocking account creation.
- **Playwright mapping:** `test/user-management/registration.spec.ts`
- **Review status:** Proposed

### UM-REG-004: Prevent duplicate registration with the same email

- **Priority:** P0
- **Type:** Negative, data integrity, security
- **Preconditions:** An account already exists with the test email.
- **Test data:** The existing email and a different display name/password.
- **Steps:**
  1. Open registration.
  2. Submit a new registration using the existing email.
- **Expected result:** Registration is rejected. Exactly one account remains for that email. The error state is clear and does not expose unrelated user data.
- **Playwright mapping:** `test/user-management/registration.spec.ts`
- **Review status:** Proposed

### UM-REG-005: Prevent duplicate registration with case or whitespace variation

- **Priority:** P0
- **Type:** Negative, boundary, security
- **Preconditions:** An account exists with a normalized email address.
- **Test data:** The same email with different casing and leading/trailing whitespace.
- **Steps:**
  1. Attempt registration using the equivalent email variant.
  2. Submit the form.
- **Expected result:** The application treats the email as already registered and does not create a second account.
- **Playwright mapping:** `test/user-management/registration.spec.ts`
- **Review status:** Proposed

---

## Registration Validation

### UM-VAL-001: Reject missing display name

- **Priority:** P0
- **Type:** Negative, validation
- **Preconditions:** Registration is available.
- **Test data:** Blank display name; valid email and password.
- **Steps:**
  1. Leave display name blank.
  2. Complete the other required fields.
  3. Submit the form.
- **Expected result:** Submission is rejected. The display name field identifies the error, and no user is stored.
- **Playwright mapping:** `test/user-management/registration.spec.ts`
- **Review status:** Proposed

### UM-VAL-002: Reject missing email

- **Priority:** P0
- **Type:** Negative, validation
- **Preconditions:** Registration is available.
- **Test data:** Valid display name and password; blank email.
- **Steps:**
  1. Leave email blank.
  2. Submit the form.
- **Expected result:** Submission is rejected with an email-required error, and no user is stored.
- **Playwright mapping:** `test/user-management/registration.spec.ts`
- **Review status:** Proposed

### UM-VAL-003: Reject missing password

- **Priority:** P0
- **Type:** Negative, validation
- **Preconditions:** Registration is available.
- **Test data:** Valid display name and email; blank password.
- **Steps:**
  1. Leave password blank.
  2. Submit the form.
- **Expected result:** Submission is rejected with a password-required error, and no user is stored.
- **Playwright mapping:** `test/user-management/registration.spec.ts`
- **Review status:** Proposed

### UM-VAL-004: Reject malformed email

- **Priority:** P1
- **Type:** Negative, validation
- **Preconditions:** Registration is available.
- **Test data:** Missing-`@`, missing-domain, and invalid-character email variants.
- **Steps:**
  1. Submit each invalid email variant with otherwise valid data.
- **Expected result:** Each submission is rejected with an actionable email error, and no user is stored.
- **Playwright mapping:** `test/user-management/registration.spec.ts`
- **Review status:** Proposed

### UM-VAL-005: Reject weak or too-short password

- **Priority:** P0
- **Type:** Negative, boundary, security
- **Preconditions:** Registration is available.
- **Test data:** Empty, fewer than 8 characters, no lowercase letter, no number, no allowed symbol, and a value containing a disallowed symbol.
- **Steps:**
  1. Submit each password variant with valid display name and email.
- **Expected result:** Each submission is rejected with guidance that the password must be at least 8 characters and include a lowercase letter, a number, and one of `$`, `@`, or `_`. The password value is not exposed in the error.
- **Playwright mapping:** `test/user-management/registration.spec.ts`
- **Review status:** Proposed

### UM-VAL-006: Accept password at the minimum allowed boundary

- **Priority:** P1
- **Type:** Positive, boundary, security
- **Preconditions:** Registration is available.
- **Test data:** An 8-character password containing at least one lowercase letter, one number, and one allowed symbol, such as `abcde1$_`.
- **Steps:**
  1. Register using the boundary-valid password.
- **Expected result:** Registration succeeds if all other data is valid.
- **Playwright mapping:** `test/user-management/registration.spec.ts`
- **Review status:** Proposed

### UM-VAL-007: Reject whitespace-only required fields

- **Priority:** P1
- **Type:** Negative, validation
- **Preconditions:** Registration is available.
- **Test data:** Whitespace-only display name, email, or password, one field at a time.
- **Steps:**
  1. Submit the form with one whitespace-only required value.
- **Expected result:** The value is treated as missing or invalid, and no user is stored.
- **Playwright mapping:** `test/user-management/registration.spec.ts`
- **Review status:** Proposed

### UM-VAL-008: Enforce field length boundaries

- **Priority:** P1
- **Type:** Negative, boundary, validation
- **Preconditions:** Maximum lengths are documented for each field.
- **Test data:** Values exactly at and one character above each maximum.
- **Steps:**
  1. Submit values at the boundary.
  2. Submit values above the boundary.
- **Expected result:** Boundary-valid values are accepted. Oversized values are rejected or safely constrained according to the approved contract; the layout remains usable.
- **Playwright mapping:** `test/user-management/registration.spec.ts`
- **Review status:** Proposed

---

## Authentication And Credential Privacy

### UM-AUTH-001: Sign in with valid credentials

- **Priority:** P0
- **Type:** Positive, smoke, end-to-end
- **Preconditions:** An active user exists with valid credentials.
- **Test data:** Existing email and password.
- **Steps:**
  1. Open the sign-in page.
  2. Enter valid credentials.
  3. Submit the form.
- **Expected result:** Sign-in succeeds and the authenticated user can access their own profile. No other user's profile data is shown.
- **Playwright mapping:** `test/user-management/security.spec.ts`
- **Review status:** Proposed

### UM-AUTH-002: Reject invalid password

- **Priority:** P0
- **Type:** Negative, security
- **Preconditions:** An active user exists.
- **Test data:** Existing email and incorrect password.
- **Steps:**
  1. Submit the invalid credentials.
- **Expected result:** Sign-in is rejected with a safe error. The user remains unauthenticated, and the response does not disclose the stored password or password rules beyond approved guidance.
- **Playwright mapping:** `test/user-management/security.spec.ts`
- **Review status:** Proposed

### UM-AUTH-003: Do not expose password in the user interface

- **Priority:** P0
- **Type:** Security, privacy
- **Preconditions:** An account exists and can be viewed or edited.
- **Test data:** Valid account credentials.
- **Steps:**
  1. Inspect registration, sign-in, and profile screens.
  2. View rendered text and input values after submission.
- **Expected result:** Password values are masked while entered and are never shown in profile views, confirmation messages, URLs, or browser-visible user data.
- **Playwright mapping:** `test/user-management/security.spec.ts`
- **Review status:** Proposed

### UM-AUTH-004: Do not expose password in client-visible responses

- **Priority:** P0
- **Type:** Security, API/integration
- **Preconditions:** Browser network inspection or an approved test API inspection method is available.
- **Test data:** A newly created user.
- **Steps:**
  1. Register or retrieve the user.
  2. Inspect client-visible response bodies and local browser storage.
- **Expected result:** No plaintext password, password hash, reset token, or other credential secret is returned to or stored in the browser.
- **Playwright mapping:** `test/user-management/security.spec.ts`
- **Review status:** Proposed

### UM-AUTH-005: Prevent authenticated access after sign-out

- **Priority:** P1
- **Type:** Negative, security
- **Preconditions:** The user is signed in.
- **Test data:** Existing active user.
- **Steps:**
  1. Sign out.
  2. Navigate directly to the profile URL or refresh a protected page.
- **Expected result:** Protected content is unavailable and the user is redirected to the approved sign-in state.
- **Playwright mapping:** `test/user-management/security.spec.ts`
- **Review status:** Proposed

---

## Profile Retrieval And Update

### UM-PRO-001: View the authenticated user's profile

- **Priority:** P0
- **Type:** Positive, end-to-end
- **Preconditions:** An active user is signed in.
- **Test data:** Account with required and optional profile fields.
- **Steps:**
  1. Open the profile page.
- **Expected result:** The profile displays the user's approved fields accurately. Password and protected credential data are absent.
- **Playwright mapping:** `test/user-management/profile.spec.ts`
- **Review status:** Proposed

### UM-PRO-002: Update display name

- **Priority:** P1
- **Type:** Positive, data integrity
- **Preconditions:** An active user is signed in.
- **Test data:** A valid new display name.
- **Steps:**
  1. Edit the display name.
  2. Save the profile.
  3. Refresh the page.
- **Expected result:** The update succeeds, a confirmation is shown, and the new display name remains after refresh.
- **Playwright mapping:** `test/user-management/profile.spec.ts`
- **Review status:** Proposed

### UM-PRO-003: Update optional profile fields

- **Priority:** P1
- **Type:** Positive, data integrity
- **Preconditions:** An active user is signed in.
- **Test data:** Valid phone number and address, then cleared values.
- **Steps:**
  1. Add or edit the optional fields.
  2. Save and refresh.
  3. Clear the optional fields.
  4. Save and refresh again.
- **Expected result:** Valid optional values persist. Clearing them is supported and does not affect account access.
- **Playwright mapping:** `test/user-management/profile.spec.ts`
- **Review status:** Proposed

### UM-PRO-004: Reject invalid profile updates

- **Priority:** P1
- **Type:** Negative, validation
- **Preconditions:** An active user is signed in.
- **Test data:** Invalid email, invalid phone, oversized display name, and invalid address variants.
- **Steps:**
  1. Submit each invalid profile value.
- **Expected result:** The update is rejected with field-level feedback. The previous valid profile remains unchanged.
- **Playwright mapping:** `test/user-management/profile.spec.ts`
- **Review status:** Proposed

### UM-PRO-005: Prevent changing email to an existing email

- **Priority:** P0
- **Type:** Negative, data integrity, security
- **Preconditions:** Two active users exist and the first user is signed in.
- **Test data:** The second user's email.
- **Steps:**
  1. Change the first user's email to the second user's email.
  2. Save the profile.
- **Expected result:** The update is rejected. Both users retain their original email addresses.
- **Playwright mapping:** `test/user-management/profile.spec.ts`
- **Review status:** Proposed

---

## Account Lifecycle

### UM-LIF-001: Deactivate an active account

- **Priority:** P0
- **Type:** Positive, lifecycle
- **Preconditions:** An active user is signed in and has no blocking product condition.
- **Test data:** Existing active user.
- **Steps:**
  1. Choose the account deactivation action.
  2. Confirm the action.
  3. Attempt to access the account again.
- **Expected result:** The account status changes to deactivated, active access ends, and the user cannot create new activity.
- **Playwright mapping:** `test/user-management/account-lifecycle.spec.ts`
- **Review status:** Proposed

### UM-LIF-002: Prevent sign-in for a deactivated user

- **Priority:** P0
- **Type:** Negative, lifecycle, security
- **Preconditions:** The test account is deactivated.
- **Test data:** Deactivated user's credentials.
- **Steps:**
  1. Attempt to sign in.
- **Expected result:** Sign-in is rejected and the user receives the approved explanation or support path.
- **Playwright mapping:** `test/user-management/account-lifecycle.spec.ts`
- **Review status:** Proposed

### UM-LIF-003: Preserve deactivated user in historical records

- **Priority:** P1
- **Type:** Data integrity, lifecycle
- **Preconditions:** A deactivated user is associated with an existing historical record seeded by the test environment.
- **Test data:** Deactivated user and historical record identifier.
- **Steps:**
  1. View the historical record as an authorized user.
- **Expected result:** The record remains valid and references the user according to the approved display/anonymization rule. The deactivated user cannot create new records.
- **Playwright mapping:** `test/user-management/account-lifecycle.spec.ts`
- **Review status:** Proposed

### UM-LIF-004: Block deletion when unsettled obligations exist

- **Priority:** P0
- **Type:** Negative, business rule, lifecycle
- **Preconditions:** The user is authenticated and seeded with an unsettled obligation.
- **Test data:** User with a pending obligation.
- **Steps:**
  1. Open account deletion.
  2. Confirm the deletion request.
- **Expected result:** Deletion is blocked. The user remains active or deactivated according to the prior state, and the message explains that obligations must be settled first without exposing unrelated financial data.
- **Playwright mapping:** `test/user-management/account-lifecycle.spec.ts`
- **Review status:** Proposed

### UM-LIF-005: Allow deletion when no unsettled obligations exist

- **Priority:** P0
- **Type:** Positive, business rule, lifecycle
- **Preconditions:** The user is authenticated and has no unsettled obligations.
- **Test data:** User with a clean obligation state.
- **Steps:**
  1. Open account deletion.
  2. Confirm the deletion request.
  3. Attempt to sign in again.
- **Expected result:** Deletion succeeds according to the approved retention/anonymization policy. The user cannot sign in or access protected profile data afterward.
- **Playwright mapping:** `test/user-management/account-lifecycle.spec.ts`
- **Review status:** Proposed

### UM-LIF-006: Cancel account deletion confirmation

- **Priority:** P1
- **Type:** Negative, usability, lifecycle
- **Preconditions:** An active user is authenticated.
- **Test data:** Existing user with no deletion-blocking obligation.
- **Steps:**
  1. Open account deletion.
  2. Cancel the confirmation dialog or navigate away.
  3. Refresh the profile.
- **Expected result:** The account remains available and no deletion state is created.
- **Playwright mapping:** `test/user-management/account-lifecycle.spec.ts`
- **Review status:** Proposed

---

## Persistence And Data Integrity

### UM-PER-001: Persist a newly created user after page refresh

- **Priority:** P0
- **Type:** Persistence, smoke, end-to-end
- **Preconditions:** The registration flow is available.
- **Test data:** Unique valid user.
- **Steps:**
  1. Register the user.
  2. Refresh the page.
  3. Open the profile or sign in again if the flow does not retain authentication.
- **Expected result:** The user exists exactly once and the stored profile data is retrievable after refresh.
- **Playwright mapping:** `test/user-management/persistence.spec.ts`
- **Review status:** Proposed

### UM-PER-002: Persist a user in a new browser session

- **Priority:** P0
- **Type:** Persistence, smoke, end-to-end
- **Preconditions:** A user was successfully registered in a separate browser context.
- **Test data:** Unique valid user.
- **Steps:**
  1. Close the original browser context.
  2. Create a new browser context.
  3. Sign in using the registered credentials.
  4. Open the profile.
- **Expected result:** Sign-in succeeds and the profile data matches the original registration.
- **Playwright mapping:** `test/user-management/persistence.spec.ts`
- **Review status:** Proposed

### UM-PER-003: Do not create duplicates on reload or repeated submission

- **Priority:** P0
- **Type:** Negative, data integrity, resilience
- **Preconditions:** Registration is available.
- **Test data:** One unique valid user.
- **Steps:**
  1. Submit registration once.
  2. Reload or revisit the result page.
  3. Repeat submission only if the UI permits it.
  4. Retrieve the user using the approved admin, repository, or API check.
- **Expected result:** Exactly one user exists for the normalized email.
- **Playwright mapping:** `test/user-management/persistence.spec.ts`
- **Review status:** Proposed

### UM-PER-004: Preserve profile changes across a new session

- **Priority:** P1
- **Type:** Persistence, data integrity
- **Preconditions:** A user exists and can update their profile.
- **Test data:** New valid display name and optional fields.
- **Steps:**
  1. Update and save the profile.
  2. Close the browser context.
  3. Open a new context and sign in.
  4. View the profile.
- **Expected result:** The updated values remain available in the new session.
- **Playwright mapping:** `test/user-management/persistence.spec.ts`
- **Review status:** Proposed

### UM-PER-005: Preserve data isolation between users

- **Priority:** P0
- **Type:** Negative, data integrity, security
- **Preconditions:** Two active users exist.
- **Test data:** Distinct profile data for each user.
- **Steps:**
  1. Sign in as user A and note the profile data.
  2. Sign out and sign in as user B.
  3. View the profile and attempt direct navigation to user A's profile resource if such a route exists.
- **Expected result:** User B sees only their own data. User A's private fields are not exposed through the UI, URL, response, or browser storage.
- **Playwright mapping:** `test/user-management/persistence.spec.ts`, `test/user-management/security.spec.ts`
- **Review status:** Proposed

---

## Authorization And Privacy

### UM-SEC-001: Reject unauthenticated profile access

- **Priority:** P0
- **Type:** Negative, authorization, security
- **Preconditions:** No active authenticated session exists.
- **Test data:** A protected profile URL or route.
- **Steps:**
  1. Navigate directly to the protected profile location.
- **Expected result:** Access is denied or redirected to sign-in. Profile data is not rendered or returned.
- **Playwright mapping:** `test/user-management/security.spec.ts`
- **Review status:** Proposed

### UM-SEC-002: Prevent user A from editing user B's profile

- **Priority:** P0
- **Type:** Negative, authorization, security
- **Preconditions:** Two active users exist; user A is signed in.
- **Test data:** User B's profile identifier and a proposed unauthorized change.
- **Steps:**
  1. Attempt to open or submit an update for user B using a direct route or request where applicable.
- **Expected result:** The operation is rejected. User B's data remains unchanged.
- **Playwright mapping:** `test/user-management/security.spec.ts`
- **Review status:** Proposed

### UM-SEC-003: Prevent sensitive data in URLs and browser storage

- **Priority:** P1
- **Type:** Security, privacy
- **Preconditions:** A user can register, sign in, and view a profile.
- **Test data:** Valid account.
- **Steps:**
  1. Inspect URLs, query strings, cookies, local storage, and session storage during the flow.
- **Expected result:** Passwords, password hashes, reset tokens, and unnecessary private profile data are not exposed in URLs or insecure browser storage.
- **Playwright mapping:** `test/user-management/security.spec.ts`
- **Review status:** Proposed

### UM-SEC-004: Handle session expiry safely

- **Priority:** P1
- **Type:** Negative, security, resilience
- **Preconditions:** A supported way exists to expire or invalidate a session.
- **Test data:** Authenticated user.
- **Steps:**
  1. Invalidate the session.
  2. Attempt to view or update the profile.
- **Expected result:** The operation is rejected and the user is returned to a safe unauthenticated state. No partial update occurs.
- **Playwright mapping:** `test/user-management/security.spec.ts`
- **Review status:** Proposed

---

## Accessibility And Resilience

### UM-A11Y-001: Complete registration using keyboard navigation

- **Priority:** P2
- **Type:** Accessibility, usability
- **Preconditions:** Registration is available.
- **Test data:** Valid registration data.
- **Steps:**
  1. Use only the keyboard to navigate, enter values, submit, and recover from validation errors.
- **Expected result:** Focus order is logical, all controls are reachable, the focused control is visible, and validation messages are associated with their fields.
- **Playwright mapping:** `test/user-management/registration.spec.ts`
- **Review status:** Proposed

### UM-A11Y-002: Expose labels and validation errors to assistive technology

- **Priority:** P2
- **Type:** Accessibility
- **Preconditions:** Registration and profile forms are available.
- **Test data:** Valid and invalid form submissions.
- **Steps:**
  1. Inspect accessible names and roles.
  2. Submit invalid data.
- **Expected result:** Inputs have meaningful accessible names, required fields are identified, and errors are announced or programmatically associated with the relevant input.
- **Playwright mapping:** `test/user-management/registration.spec.ts`, `test/user-management/profile.spec.ts`
- **Review status:** Proposed

### UM-RES-001: Preserve entered values after a recoverable validation error

- **Priority:** P2
- **Type:** Resilience, usability
- **Preconditions:** Registration is available.
- **Test data:** Valid values in all fields except one invalid field.
- **Steps:**
  1. Submit the invalid form.
  2. Correct only the invalid field.
  3. Submit again.
- **Expected result:** Valid previously entered values remain available, the corrected submission succeeds, and no duplicate account is created.
- **Playwright mapping:** `test/user-management/registration.spec.ts`
- **Review status:** Proposed

### UM-RES-002: Handle a storage or service failure without false success

- **Priority:** P1
- **Type:** Negative, resilience, data integrity
- **Preconditions:** The test environment can simulate a storage or service failure.
- **Test data:** Valid registration data.
- **Steps:**
  1. Make the storage operation fail.
  2. Submit the registration.
  3. Restore the service and retry using the same email.
- **Expected result:** The first attempt shows a failure state and does not claim that the user was created. The retry behavior is deterministic and does not create an unknown duplicate.
- **Playwright mapping:** `test/user-management/registration.spec.ts`, `test/user-management/persistence.spec.ts`
- **Review status:** Proposed

### UM-RES-003: Prevent duplicate submission while a request is pending

- **Priority:** P1
- **Type:** Negative, resilience, data integrity
- **Preconditions:** Registration is available and request latency can be observed or controlled.
- **Test data:** Valid unique user.
- **Steps:**
  1. Submit the registration.
  2. Quickly activate the submit action again before the first request completes.
- **Expected result:** The UI prevents duplicate requests or the server idempotently creates one account only. The user sees one unambiguous result.
- **Playwright mapping:** `test/user-management/registration.spec.ts`
- **Review status:** Proposed

---

## Traceability Summary

| Manual area | Case IDs | Planned Playwright spec |
|---|---|---|
| Registration | `UM-REG-001` to `UM-REG-005` | `test/user-management/registration.spec.ts` |
| Validation | `UM-VAL-001` to `UM-VAL-008` | `test/user-management/registration.spec.ts` |
| Authentication and credentials | `UM-AUTH-001` to `UM-AUTH-005` | `test/user-management/security.spec.ts` |
| Profile | `UM-PRO-001` to `UM-PRO-005` | `test/user-management/profile.spec.ts` |
| Account lifecycle | `UM-LIF-001` to `UM-LIF-006` | `test/user-management/account-lifecycle.spec.ts` |
| Persistence | `UM-PER-001` to `UM-PER-005` | `test/user-management/persistence.spec.ts` |
| Authorization and privacy | `UM-SEC-001` to `UM-SEC-004` | `test/user-management/security.spec.ts` |
| Accessibility | `UM-A11Y-001` to `UM-A11Y-002` | Registration/profile specs |
| Resilience | `UM-RES-001` to `UM-RES-003` | Registration/persistence specs |

## Review Checklist

Before writing Playwright tests, confirm:

- [ ] Required and optional registration fields are approved.
- [x] The password-strength rule is approved: at least 8 characters, one lowercase letter, one number, and one of `$`, `@`, or `_`.
- [ ] Email normalization and uniqueness behavior are approved.
- [ ] Deactivation and reactivation behavior is approved.
- [ ] Deletion behavior with and without unsettled obligations is approved.
- [ ] Post-deletion retention or anonymization behavior is approved.
- [ ] Error messages and account-enumeration behavior are approved.
- [ ] The test environment can create isolated users and seed the two deletion obligation states.
- [ ] The application URL and registration/profile selectors or accessible names are available for Playwright.
- [ ] Cases marked P0 and P1 have an implementation owner and target iteration.

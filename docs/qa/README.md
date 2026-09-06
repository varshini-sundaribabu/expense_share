# QA Documentation

This folder contains the manual QA cases for each product feature. The manual cases are reviewed before their browser automation is implemented.

## Test Placement

```text
docs/qa/                         # Manual QA cases and feature contracts
test/<feature>/*.spec.ts         # Playwright browser journeys by feature
test/fixtures/                   # Shared Playwright fixtures and test data
test/pages/                      # Page objects containing routes, locators, and UI actions
src/**/*.test.ts                 # Unit or component tests near implementation
```

Use feature-based folders for Playwright tests. A test belongs with the user capability it verifies, not with the UI page or technical layer that happens to implement it.

## Page Object Model

Playwright tests use the custom fixture in `test/fixtures/pages.ts`. It provides page objects such as `registrationPage`, `signInPage`, and `profilePage` to each test.

- Page objects own routes, accessible locators, and reusable UI actions.
- Specs own the scenario intent, manual case ID, assertions, and test data choices.
- Shared setup such as registration and sign-in belongs in `test/fixtures/user.ts` and should call page-object methods.
- Direct `page` access is reserved for browser contexts, API requests, storage inspection, route interception, and assertions that cross page-object boundaries.
- When a UI selector changes, update the relevant page object instead of editing every feature spec.

## Test Levels

- **Unit:** A single function, rule, or domain operation in isolation.
- **Component:** A UI component and its local states, without a full application journey.
- **API/integration:** Storage, authentication, and service contracts across module boundaries.
- **End-to-end:** A realistic browser journey through the running application. Playwright tests belong here.
- **Manual QA:** The reviewed feature contract, including exploratory, usability, accessibility, security, and resilience checks.

One behavior may appear at more than one level, but each level should verify something different. Keep detailed business rules close to unit or API tests, and keep Playwright focused on critical user-visible journeys.

## Test Case IDs

User Management uses the prefix `UM`:

- `UM-REG-*` - Registration and account creation
- `UM-VAL-*` - Field validation and input boundaries
- `UM-AUTH-*` - Authentication and credential privacy
- `UM-PRO-*` - Profile retrieval and update
- `UM-LIF-*` - Deactivation and account deletion
- `UM-PER-*` - Persistence and data integrity
- `UM-SEC-*` - Authorization and privacy
- `UM-A11Y-*` - Accessibility
- `UM-RES-*` - Resilience and reliability

Expense Creation and Splitting uses the prefix `EX`:

- `EX-CREATE-*` - Expense creation and optional metadata
- `EX-VAL-*` - Expense field validation and boundaries
- `EX-PART-*` - Participants and payer rules
- `EX-SPLIT-EQUAL-*` - Equal splits and rounding
- `EX-SPLIT-PERCENT-*` - Percentage splits
- `EX-SPLIT-FIXED-*` - Fixed-amount splits
- `EX-DATA-*` - Persistence, atomicity, and data integrity
- `EX-SEC-*` - Authorization and privacy
- `EX-RES-*` - Resilience and failure recovery
- `EX-A11Y-*` - Accessibility and keyboard workflows

IDs are stable. Do not reuse an ID after a case is removed; split a case into a new ID when its behavior changes materially.

## Priority And Status

- **P0:** Blocks account creation, data integrity, authentication, or a critical privacy/security rule.
- **P1:** Important supported behavior or a high-value negative path.
- **P2:** Secondary behavior, usability, accessibility, or resilience coverage.

Each manual case records `Review status: Proposed` until the product decision is approved. After implementation, use `Not automated`, `Automated`, `Blocked`, or `Retired` as appropriate.

## Playwright Tags

When the browser suite is added, use tags consistently:

- `@red` - Intentionally unfinished behavior that should currently fail.
- `@smoke` - Critical path needed for a basic release check.
- `@regression` - Existing behavior that must remain stable.
- `@security` - Authentication, authorization, privacy, or credential handling.
- `@persistence` - Refresh, new-session, or storage durability behavior.
- `@a11y` - Accessibility behavior.

Red tests must fail because the product behavior is not implemented. They must not be hidden with broad `skip` calls or allowed to fail because of missing fixtures, broken selectors, or an unavailable application.

## Execution And Isolation

- Use unique email addresses for tests that create users.
- Prefer API or repository setup for prerequisite data when that support exists; use the browser for the behavior under test.
- Clean up created users and related records after each test or use an isolated test database.
- A new browser context is required when testing persistence across sessions.
- Capture the manual case ID in the Playwright title or annotation, for example: `UM-PER-001 persists after a new browser session @red @persistence`.
- Do not use real personal data, credentials, or production accounts.

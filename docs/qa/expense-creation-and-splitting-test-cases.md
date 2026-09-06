# Expense Creation And Splitting Test Cases

## Purpose

This document contains the manual QA cases for creating one-time shared expenses and splitting their cost among participants. It is the review source for the future Playwright acceptance suite.

## Product Rules Under Test

These rules define the expected behavior for the expense creation and splitting feature:

- An authenticated active user can create an expense.
- Required expense fields are description, amount, currency, category, expense date, payer, and at least one participant.
- The payer must be an active known user and may also be a participant.
- Participants must be active known users associated with the expense.
- Amounts must be positive and use the application's supported precision.
- The expense currency and every split use the same currency.
- Supported split types are equal, percentage, and fixed amount.
- Equal splits divide the expense total across all participants and handle rounding deterministically.
- Percentage splits must total exactly 100%.
- Fixed-amount splits must total exactly the expense amount.
- Split amounts are calculated and stored separately from the expense record.
- A split cannot be assigned to a non-participant.
- The creator is the owner of the expense unless a future group-permission rule says otherwise.
- Users can view, edit, and delete only expenses they are authorized to manage.
- Expense creation is atomic: a failed split validation must not leave a partial expense or partial split records.
- A created expense remains available after page refresh and in a new authenticated browser session.
- Deactivated users cannot create new expenses, but remain valid references in historical expense records.
- Payment method is optional metadata and must not affect financial calculations.
- Recurring schedules, balance calculation, settlement workflows, and debt optimization are separate features.

## Test Data Conventions

Use isolated users and unique expense data for each create test.

| Data | Example |
|---|---|
| Expense description | `Team dinner - unique id` |
| Valid amount | `120.00` |
| Small positive amount | `0.01` |
| Zero amount | `0` |
| Negative amount | `-25.00` |
| Excess precision | `10.999` |
| Currency | `USD` |
| Unsupported currency | `XYZ` |
| Category | `Food` |
| Valid date | A date on or before the approved current-date boundary |
| Future date | A date after the approved future-date boundary |
| Payment method | `Credit card` |
| Equal split participants | Three active users |
| Percentage split | `50%`, `30%`, `20%` |
| Fixed split | `50.00`, `30.00`, `40.00` for a `120.00` expense |
| Invalid percentage total | `60%`, `30%` |
| Invalid fixed total | `50.00`, `50.00` for a `120.00` expense |

Never use real personal or financial information. Test users must be isolated and removed after execution where the environment allows it.

## Manual Case Format

Each case contains a stable ID, priority, type, preconditions, test data, steps, expected result, future automation mapping, and review status.

---

## Expense Creation

### EX-CREATE-001: Create an expense with required fields

- **Priority:** P0
- **Type:** Positive, smoke, end-to-end
- **Preconditions:** An active user is authenticated. At least one eligible participant exists.
- **Test data:** Valid description, amount, currency, category, expense date, payer, and participant.
- **Steps:**
  1. Open the create-expense page.
  2. Enter all required fields.
  3. Select the payer and participant.
  4. Submit the expense.
- **Expected result:** The expense is created once, appears in the user's expense list, and shows the correct owner, payer, participant, amount, currency, date, and category.
- **Playwright mapping:** `test/expenses/creation.spec.ts`
- **Review status:** Proposed

### EX-CREATE-002: Create an expense with optional payment method

- **Priority:** P1
- **Type:** Positive, data integrity
- **Preconditions:** An active authenticated user can create an expense.
- **Test data:** Valid expense data plus `Credit card` as payment method.
- **Steps:**
  1. Complete the expense form.
  2. Add a payment method.
  3. Submit the expense.
  4. Open the expense details.
- **Expected result:** The payment method is stored as metadata and displayed in the details without changing the expense amount or split calculations.
- **Playwright mapping:** `test/expenses/creation.spec.ts`
- **Review status:** Proposed

### EX-CREATE-003: Create an expense without optional payment method

- **Priority:** P1
- **Type:** Positive, boundary
- **Preconditions:** An active authenticated user can create an expense.
- **Test data:** Valid required fields; blank payment method.
- **Steps:**
  1. Leave payment method blank.
  2. Submit the expense.
- **Expected result:** The expense is created successfully and the payment method is stored as empty or null according to the API contract.
- **Playwright mapping:** `test/expenses/creation.spec.ts`
- **Review status:** Proposed

### EX-CREATE-004: Prevent unauthenticated expense creation

- **Priority:** P0
- **Type:** Negative, authorization, security
- **Preconditions:** No authenticated session exists.
- **Test data:** Otherwise valid expense data.
- **Steps:**
  1. Navigate directly to the create-expense page.
  2. Submit a valid expense through the UI or approved request path.
- **Expected result:** Access is denied or redirected to sign-in. No expense or split record is created.
- **Playwright mapping:** `test/expenses/security.spec.ts`
- **Review status:** Proposed

### EX-CREATE-005: Prevent a deactivated user from creating an expense

- **Priority:** P0
- **Type:** Negative, lifecycle, authorization
- **Preconditions:** The user account is deactivated.
- **Test data:** Valid expense data.
- **Steps:**
  1. Attempt to open or submit the create-expense flow.
- **Expected result:** Creation is rejected with an appropriate account-status message. Historical records remain available according to the approved policy.
- **Playwright mapping:** `test/expenses/security.spec.ts`
- **Review status:** Proposed

### EX-CREATE-006: Prevent duplicate expense creation on repeated submission

- **Priority:** P0
- **Type:** Negative, resilience, data integrity
- **Preconditions:** An authenticated active user is on a valid create-expense form.
- **Test data:** One valid expense.
- **Steps:**
  1. Submit the form.
  2. Quickly submit again or refresh/retry the result page.
  3. Retrieve the user's expenses.
- **Expected result:** Exactly one expense exists for the submission. The UI prevents duplicate requests or the server handles the request idempotently.
- **Playwright mapping:** `test/expenses/creation.spec.ts`
- **Review status:** Proposed

---

## Expense Field Validation

### EX-VAL-001: Reject missing description

- **Priority:** P0
- **Type:** Negative, validation
- **Preconditions:** An authenticated active user can open the form.
- **Test data:** Blank description; all other fields valid.
- **Steps:**
  1. Leave description blank.
  2. Submit the form.
- **Expected result:** The form identifies the description error and no expense or split is stored.
- **Playwright mapping:** `test/expenses/creation.spec.ts`
- **Review status:** Proposed

### EX-VAL-002: Reject missing amount

- **Priority:** P0
- **Type:** Negative, validation
- **Preconditions:** The expense form is available.
- **Test data:** Blank amount; all other fields valid.
- **Steps:**
  1. Leave amount blank.
  2. Submit the form.
- **Expected result:** The form identifies the amount error and no expense is stored.
- **Playwright mapping:** `test/expenses/creation.spec.ts`
- **Review status:** Proposed

### EX-VAL-003: Reject zero and negative amounts

- **Priority:** P0
- **Type:** Negative, boundary, validation
- **Preconditions:** The expense form is available.
- **Test data:** `0` and `-25.00`.
- **Steps:**
  1. Submit each invalid amount with otherwise valid data.
- **Expected result:** Each submission is rejected with a positive-amount error and no expense is stored.
- **Playwright mapping:** `test/expenses/creation.spec.ts`
- **Review status:** Proposed

### EX-VAL-004: Accept the smallest supported positive amount

- **Priority:** P1
- **Type:** Positive, boundary
- **Preconditions:** The supported currency precision is documented.
- **Test data:** `0.01` or the smallest supported unit.
- **Steps:**
  1. Create an expense using the smallest valid amount.
- **Expected result:** The expense is accepted and displayed using the approved currency precision.
- **Playwright mapping:** `test/expenses/creation.spec.ts`
- **Review status:** Proposed

### EX-VAL-005: Reject unsupported amount precision

- **Priority:** P1
- **Type:** Negative, boundary
- **Preconditions:** Currency precision rules are documented.
- **Test data:** `10.999` or another value beyond supported precision.
- **Steps:**
  1. Submit the amount with excess precision.
- **Expected result:** The application rejects the value or normalizes it according to the approved financial rule. It must not silently introduce rounding disagreement between the expense and splits.
- **Playwright mapping:** `test/expenses/creation.spec.ts`
- **Review status:** Proposed

### EX-VAL-006: Reject missing or unsupported currency

- **Priority:** P0
- **Type:** Negative, validation
- **Preconditions:** The supported currency list is documented.
- **Test data:** Blank currency and unsupported currency `XYZ`.
- **Steps:**
  1. Submit each invalid currency value.
- **Expected result:** The expense is rejected with a clear currency error and no partial records are created.
- **Playwright mapping:** `test/expenses/creation.spec.ts`
- **Review status:** Proposed

### EX-VAL-007: Validate expense date boundaries

- **Priority:** P1
- **Type:** Positive and negative, boundary
- **Preconditions:** The allowed date range is documented.
- **Test data:** Boundary-valid date, date before the allowed range, and future date beyond the allowed range.
- **Steps:**
  1. Submit each date variant with otherwise valid data.
- **Expected result:** Boundary-valid dates are accepted. Dates outside the approved range are rejected with a clear message.
- **Playwright mapping:** `test/expenses/creation.spec.ts`
- **Review status:** Proposed

### EX-VAL-008: Enforce description and category length boundaries

- **Priority:** P1
- **Type:** Negative, boundary
- **Preconditions:** Maximum field lengths are documented.
- **Test data:** Values exactly at and one character above the limits.
- **Steps:**
  1. Submit boundary-valid values.
  2. Submit oversized values.
- **Expected result:** Boundary-valid values are accepted. Oversized values are rejected with field-level feedback and no partial expense.
- **Playwright mapping:** `test/expenses/creation.spec.ts`
- **Review status:** Proposed

---

## Participants And Payer

### EX-PART-001: Create an expense with the payer as a participant

- **Priority:** P0
- **Type:** Positive, business rule
- **Preconditions:** The authenticated user and another active user exist.
- **Test data:** Authenticated user as payer and participant; second active user as another participant.
- **Steps:**
  1. Select the authenticated user as payer.
  2. Add the payer and second user as participants.
  3. Submit the expense.
- **Expected result:** The payer is included in the participant list and receives a calculated share.
- **Playwright mapping:** `test/expenses/participants.spec.ts`
- **Review status:** Proposed

### EX-PART-002: Create an expense with a payer who is not a participant

- **Priority:** P1
- **Type:** Positive or negative, product decision required
- **Preconditions:** A payer and at least one participant exist.
- **Test data:** Payer excluded from participant selection.
- **Steps:**
  1. Select the payer.
  2. Exclude the payer from participants.
  3. Submit the expense.
- **Expected result:** The result follows the approved product rule. If disallowed, the form explains that the payer must participate. If allowed, the payer is stored separately and balances remain correct.
- **Playwright mapping:** `test/expenses/participants.spec.ts`
- **Review status:** Needs product decision

### EX-PART-003: Reject an unknown participant

- **Priority:** P0
- **Type:** Negative, validation, authorization
- **Preconditions:** An authenticated active user creates an expense.
- **Test data:** An unknown or nonexistent user identifier.
- **Steps:**
  1. Attempt to submit an expense referencing the unknown user.
- **Expected result:** Submission is rejected and no expense or split references the unknown user.
- **Playwright mapping:** `test/expenses/participants.spec.ts`
- **Review status:** Proposed

### EX-PART-004: Reject a deactivated participant for a new expense

- **Priority:** P1
- **Type:** Negative, lifecycle, validation
- **Preconditions:** A deactivated historical user exists.
- **Test data:** Deactivated user selected as a new participant.
- **Steps:**
  1. Attempt to add the deactivated user to a new expense.
  2. Submit the expense.
- **Expected result:** The new expense is rejected or the deactivated user is unavailable for selection according to the approved policy.
- **Playwright mapping:** `test/expenses/participants.spec.ts`
- **Review status:** Proposed

### EX-PART-005: Prevent duplicate participants

- **Priority:** P1
- **Type:** Negative, data integrity
- **Preconditions:** The participant picker is available.
- **Test data:** The same active user selected twice.
- **Steps:**
  1. Attempt to add the same user twice.
  2. Submit the expense.
- **Expected result:** The participant list contains the user once and the split calculation counts the user once.
- **Playwright mapping:** `test/expenses/participants.spec.ts`
- **Review status:** Proposed

---

## Equal Splitting

### EX-SPLIT-EQUAL-001: Split an expense equally between two participants

- **Priority:** P0
- **Type:** Positive, smoke, calculation
- **Preconditions:** Two active participants exist.
- **Test data:** Expense amount `120.00`; two participants.
- **Steps:**
  1. Select equal split.
  2. Submit the expense.
  3. Open expense details.
- **Expected result:** Each participant has a calculated share of `60.00`. The split total equals `120.00`.
- **Playwright mapping:** `test/expenses/splitting.spec.ts`
- **Review status:** Proposed

### EX-SPLIT-EQUAL-002: Split an expense equally between three participants

- **Priority:** P0
- **Type:** Positive, calculation
- **Preconditions:** Three active participants exist.
- **Test data:** Expense amount `120.00`; three participants.
- **Steps:**
  1. Select equal split.
  2. Submit the expense.
- **Expected result:** Each participant has a share of `40.00` and the total is exactly `120.00`.
- **Playwright mapping:** `test/expenses/splitting.spec.ts`
- **Review status:** Proposed

### EX-SPLIT-EQUAL-003: Handle equal split rounding deterministically

- **Priority:** P0
- **Type:** Positive, boundary, calculation
- **Preconditions:** Three active participants exist.
- **Test data:** Expense amount `100.00`.
- **Steps:**
  1. Select equal split.
  2. Submit the expense.
  3. Inspect all calculated shares.
- **Expected result:** The shares use the documented rounding strategy, sum exactly to `100.00`, and identify which participant receives any remainder if applicable.
- **Playwright mapping:** `test/expenses/splitting.spec.ts`
- **Review status:** Needs product decision

### EX-SPLIT-EQUAL-004: Recalculate equal shares when participants change

- **Priority:** P1
- **Type:** Positive, state transition
- **Preconditions:** A draft expense has two participants.
- **Test data:** Add a third participant, then remove one participant.
- **Steps:**
  1. Observe the split after adding the third participant.
  2. Remove a participant.
  3. Submit the expense.
- **Expected result:** The displayed and stored shares recalculate from the current participant list only.
- **Playwright mapping:** `test/expenses/splitting.spec.ts`
- **Review status:** Proposed

---

## Percentage Splitting

### EX-SPLIT-PERCENT-001: Split an expense using percentages totaling 100%

- **Priority:** P0
- **Type:** Positive, calculation
- **Preconditions:** Three active participants exist.
- **Test data:** Amount `120.00`; percentages `50%`, `30%`, `20%`.
- **Steps:**
  1. Select percentage split.
  2. Enter the percentages.
  3. Submit the expense.
- **Expected result:** Calculated amounts are `60.00`, `36.00`, and `24.00`; the percentage total is `100%`; the split amount total is `120.00`.
- **Playwright mapping:** `test/expenses/splitting.spec.ts`
- **Review status:** Proposed

### EX-SPLIT-PERCENT-002: Reject percentages totaling less than 100%

- **Priority:** P0
- **Type:** Negative, validation, calculation
- **Preconditions:** Percentage split is selected.
- **Test data:** Percentages `60%` and `30%`.
- **Steps:**
  1. Submit the incomplete percentage allocation.
- **Expected result:** Submission is rejected with a clear total-percent error and no expense or split records are stored.
- **Playwright mapping:** `test/expenses/splitting.spec.ts`
- **Review status:** Proposed

### EX-SPLIT-PERCENT-003: Reject percentages totaling more than 100%

- **Priority:** P0
- **Type:** Negative, validation, calculation
- **Preconditions:** Percentage split is selected.
- **Test data:** Percentages `70%` and `40%`.
- **Steps:**
  1. Submit the over-allocated percentage split.
- **Expected result:** Submission is rejected with a clear total-percent error and no partial records are stored.
- **Playwright mapping:** `test/expenses/splitting.spec.ts`
- **Review status:** Proposed

### EX-SPLIT-PERCENT-004: Reject negative or invalid percentage values

- **Priority:** P1
- **Type:** Negative, validation
- **Preconditions:** Percentage split is selected.
- **Test data:** Negative percentage, text, blank percentage, and percentage above 100.
- **Steps:**
  1. Submit each invalid percentage value.
- **Expected result:** Each invalid value is rejected with field-level feedback.
- **Playwright mapping:** `test/expenses/splitting.spec.ts`
- **Review status:** Proposed

### EX-SPLIT-PERCENT-005: Handle percentage rounding without changing the total

- **Priority:** P1
- **Type:** Positive, boundary, calculation
- **Preconditions:** Percentage split is selected.
- **Test data:** Amount `100.00`; percentages that produce fractional cents.
- **Steps:**
  1. Submit the percentage split.
  2. Inspect calculated amounts.
- **Expected result:** Currency rounding follows the approved strategy and all calculated amounts sum exactly to the expense total.
- **Playwright mapping:** `test/expenses/splitting.spec.ts`
- **Review status:** Needs product decision

---

## Fixed-Amount Splitting

### EX-SPLIT-FIXED-001: Split an expense using fixed amounts totaling the expense

- **Priority:** P0
- **Type:** Positive, calculation
- **Preconditions:** Fixed-amount split is selected.
- **Test data:** Amount `120.00`; fixed shares `50.00`, `30.00`, `40.00`.
- **Steps:**
  1. Enter a fixed amount for each participant.
  2. Submit the expense.
- **Expected result:** The stored calculated amounts match the entered values and total exactly `120.00`.
- **Playwright mapping:** `test/expenses/splitting.spec.ts`
- **Review status:** Proposed

### EX-SPLIT-FIXED-002: Reject fixed amounts totaling less than the expense

- **Priority:** P0
- **Type:** Negative, validation, calculation
- **Preconditions:** Fixed-amount split is selected.
- **Test data:** Expense `120.00`; fixed shares totaling `100.00`.
- **Steps:**
  1. Submit the under-allocated fixed split.
- **Expected result:** Submission is rejected with a clear total-amount error and no partial records are stored.
- **Playwright mapping:** `test/expenses/splitting.spec.ts`
- **Review status:** Proposed

### EX-SPLIT-FIXED-003: Reject fixed amounts totaling more than the expense

- **Priority:** P0
- **Type:** Negative, validation, calculation
- **Preconditions:** Fixed-amount split is selected.
- **Test data:** Expense `120.00`; fixed shares totaling `130.00`.
- **Steps:**
  1. Submit the over-allocated fixed split.
- **Expected result:** Submission is rejected with a clear total-amount error and no partial records are stored.
- **Playwright mapping:** `test/expenses/splitting.spec.ts`
- **Review status:** Proposed

### EX-SPLIT-FIXED-004: Reject negative fixed amounts

- **Priority:** P1
- **Type:** Negative, validation
- **Preconditions:** Fixed-amount split is selected.
- **Test data:** A negative participant share.
- **Steps:**
  1. Submit the split.
- **Expected result:** Submission is rejected and the invalid participant share is identified.
- **Playwright mapping:** `test/expenses/splitting.spec.ts`
- **Review status:** Proposed

### EX-SPLIT-FIXED-005: Prevent duplicate fixed split entries

- **Priority:** P1
- **Type:** Negative, data integrity
- **Preconditions:** Fixed-amount split is selected.
- **Test data:** The same participant appears twice.
- **Steps:**
  1. Attempt to submit duplicate entries for one participant.
- **Expected result:** The participant appears once or submission is rejected; two shares must never be stored for the same participant in one expense.
- **Playwright mapping:** `test/expenses/splitting.spec.ts`
- **Review status:** Proposed

---

## Persistence, Authorization, And Resilience

### EX-DATA-001: Persist an expense after page refresh

- **Priority:** P0
- **Type:** Persistence, smoke
- **Preconditions:** A valid expense has been created.
- **Test data:** Created expense identifier.
- **Steps:**
  1. Refresh the expense details page.
  2. Reopen the expense from the list.
- **Expected result:** Expense fields, payer, participants, split type, and calculated shares remain unchanged.
- **Playwright mapping:** `test/expenses/persistence.spec.ts`
- **Review status:** Proposed

### EX-DATA-002: Persist an expense in a new browser session

- **Priority:** P0
- **Type:** Persistence, smoke
- **Preconditions:** A valid expense exists for the authenticated user.
- **Test data:** Expense credentials and identifier.
- **Steps:**
  1. Close the current browser context.
  2. Open a new context and sign in.
  3. Open the expense list and details.
- **Expected result:** The expense and all split calculations are available in the new session.
- **Playwright mapping:** `test/expenses/persistence.spec.ts`
- **Review status:** Proposed

### EX-DATA-003: Do not create partial records after split validation failure

- **Priority:** P0
- **Type:** Negative, atomicity, data integrity
- **Preconditions:** The test environment can query the user's expenses or approved API state.
- **Test data:** Invalid percentage or fixed split total.
- **Steps:**
  1. Submit the invalid split.
  2. Query the expense and split records.
- **Expected result:** Neither the expense nor any split records exist for the failed submission.
- **Playwright mapping:** `test/expenses/persistence.spec.ts`
- **Review status:** Proposed

### EX-SEC-001: Prevent another user from viewing an expense

- **Priority:** P0
- **Type:** Negative, authorization, security
- **Preconditions:** User A owns an expense. User B is authenticated separately.
- **Test data:** User A's expense identifier.
- **Steps:**
  1. Sign in as user B.
  2. Navigate directly to user A's expense URL.
- **Expected result:** Access is denied without revealing expense, payer, participant, or split data.
- **Playwright mapping:** `test/expenses/security.spec.ts`
- **Review status:** Proposed

### EX-SEC-002: Prevent another user from editing an expense

- **Priority:** P0
- **Type:** Negative, authorization, security
- **Preconditions:** User A owns an expense. User B is authenticated separately.
- **Test data:** User A's expense identifier and an attempted edit.
- **Steps:**
  1. Sign in as user B.
  2. Attempt to edit and save user A's expense.
- **Expected result:** The operation is rejected and the original expense remains unchanged.
- **Playwright mapping:** `test/expenses/security.spec.ts`
- **Review status:** Proposed

### EX-SEC-003: Prevent unauthorized expense deletion

- **Priority:** P0
- **Type:** Negative, authorization, security
- **Preconditions:** User A owns an expense. User B is authenticated separately.
- **Test data:** User A's expense identifier.
- **Steps:**
  1. Attempt to delete user A's expense as user B.
- **Expected result:** Deletion is rejected and the expense remains available to user A.
- **Playwright mapping:** `test/expenses/security.spec.ts`
- **Review status:** Proposed

### EX-RES-001: Recover from a storage failure without false success

- **Priority:** P1
- **Type:** Negative, resilience
- **Preconditions:** The test environment can simulate a database or service failure.
- **Test data:** Valid expense and split data.
- **Steps:**
  1. Make the create request fail.
  2. Submit the expense.
  3. Restore storage and retry.
- **Expected result:** The failed request does not show success or leave partial records. The retry has one deterministic outcome.
- **Playwright mapping:** `test/expenses/creation.spec.ts`, `test/expenses/persistence.spec.ts`
- **Review status:** Proposed

### EX-A11Y-001: Complete expense creation with keyboard navigation

- **Priority:** P2
- **Type:** Accessibility, usability
- **Preconditions:** The create-expense form is available.
- **Test data:** Valid expense and split data.
- **Steps:**
  1. Navigate through the form using only the keyboard.
  2. Select participants and split type.
  3. Submit the expense.
- **Expected result:** Focus order is logical, all controls are reachable, selected values are announced, and the expense can be created without a pointer.
- **Playwright mapping:** `test/expenses/creation.spec.ts`
- **Review status:** Proposed

### EX-A11Y-002: Associate split and validation errors with controls

- **Priority:** P2
- **Type:** Accessibility, validation
- **Preconditions:** The create-expense form is available.
- **Test data:** Invalid amount and invalid split total.
- **Steps:**
  1. Submit invalid data.
  2. Inspect accessible names, invalid states, and error associations.
- **Expected result:** Errors are announced or programmatically associated with the relevant amount, participant, and split controls.
- **Playwright mapping:** `test/expenses/creation.spec.ts`, `test/expenses/splitting.spec.ts`
- **Review status:** Proposed

---

## Traceability Summary

| Manual area | Case IDs | Planned Playwright spec |
|---|---|---|
| Expense creation | `EX-CREATE-001` to `EX-CREATE-006` | `test/expenses/creation.spec.ts` |
| Expense validation | `EX-VAL-001` to `EX-VAL-008` | `test/expenses/creation.spec.ts` |
| Participants and payer | `EX-PART-001` to `EX-PART-005` | `test/expenses/participants.spec.ts` |
| Equal splitting | `EX-SPLIT-EQUAL-001` to `EX-SPLIT-EQUAL-004` | `test/expenses/splitting.spec.ts` |
| Percentage splitting | `EX-SPLIT-PERCENT-001` to `EX-SPLIT-PERCENT-005` | `test/expenses/splitting.spec.ts` |
| Fixed splitting | `EX-SPLIT-FIXED-001` to `EX-SPLIT-FIXED-005` | `test/expenses/splitting.spec.ts` |
| Persistence and atomicity | `EX-DATA-001` to `EX-DATA-003` | `test/expenses/persistence.spec.ts` |
| Authorization | `EX-SEC-001` to `EX-SEC-003` | `test/expenses/security.spec.ts` |
| Resilience | `EX-RES-001` | Creation/persistence specs |
| Accessibility | `EX-A11Y-001` to `EX-A11Y-002` | Creation/splitting specs |

## Review Checklist

Before writing Playwright tests, confirm:

- [ ] Required expense fields are approved.
- [ ] Supported currencies are approved.
- [ ] Amount precision and rounding behavior are approved.
- [ ] Expense-date boundary rules are approved.
- [ ] Whether the payer must be a participant is approved.
- [ ] Participant eligibility for deactivated users is approved.
- [ ] Equal-split remainder allocation is approved.
- [ ] Percentage and fixed split total tolerance is approved.
- [ ] Whether an expense can be edited after a settlement is approved.
- [ ] Expense ownership and group authorization rules are approved.
- [ ] The test environment can create isolated users and query expense/split state.
- [ ] The application routes and accessible names for expense creation are approved.
- [ ] P0 and P1 cases have an implementation owner and target feature slice.

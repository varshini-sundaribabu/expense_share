# Expense Sharer

Expense Sharer is a shared-expense tracker for recording group purchases, splitting the cost fairly, and keeping track of who owes whom. It is intended as a test-first demonstration project built with TypeScript, Next.js, and Playwright.

## Goals

- Make it quick to record an expense and identify who paid.
- Support equal, percentage-based, and fixed-amount splits.
- Show each participant's net balance clearly.
- Make settling debts traceable without changing the original expense.
- Protect account and personal information throughout the user lifecycle.

## Planned Features

### Accounts and Profiles

- Register and sign in securely.
- View and edit a profile.
- Find or invite other users to share an expense.
- Deactivate an account and request deletion of personal data.
- Keep authentication credentials separate from profile data; passwords must never be stored or displayed in plain text.

### Expenses

- Create an expense with a description, amount, currency, category, date, and payer.
- Add one or more participants.
- Split an expense equally, by percentage, or by fixed amounts.
- Edit or delete an expense with appropriate authorization.
- Record the payment method as optional metadata about how the payer paid.
- List, filter, and view expense details.
- Validate that the total of all splits equals the expense total.

### Recurring Expenses

- Create an optional recurring schedule, such as weekly or monthly.
- Define the next occurrence and an optional end date.
- Generate separate expense records for each occurrence rather than mutating the original expense.
- Pause, resume, or cancel a recurring schedule.

### Balances and Settlements

- Calculate balances from expenses and recorded settlements.
- Show the amount each user owes or is owed.
- Record a settlement between two users with an amount, currency, date, and optional note.
- Keep settlements as immutable history so an expense's original audit trail remains intact.

## Core Domain Model

The following entities describe the intended domain. They are deliberately separated so that a recurring rule or settlement is not confused with an expense itself.

### User

Represents an account and its profile information.

- `id`
- `displayName`
- `email`
- `phoneNumber` (optional)
- `address` (optional)
- `createdAt`
- `updatedAt`
- `status` (`active`, `deactivated`, or `pendingDeletion`)

Authentication data such as a password hash, sessions, and reset tokens belongs in a protected authentication boundary, not in the user profile returned to the client.

### Expense

Represents one purchase or bill. An expense has exactly one payer and one or more participant splits.

- `id`
- `description`
- `amount`
- `currency`
- `category`
- `expenseDate`
- `createdBy`
- `paidBy`
- `paymentMethod` (optional metadata)
- `recurringScheduleId` (optional)
- `createdAt`
- `updatedAt`
- `deletedAt` (optional, if soft deletion is used)

### Expense Split

Represents one participant's share of an expense. This should be a separate entity rather than a collection of loosely related fields on `Expense`.

- `id`
- `expenseId`
- `userId`
- `shareType` (`equal`, `percentage`, or `fixedAmount`)
- `shareValue`
- `calculatedAmount`

An expense's calculated split amounts must add up to its total amount. A user may be both the payer and a participant.

### Recurring Schedule

Represents the rule used to create future expenses.

- `id`
- `frequency` (for example, `weekly` or `monthly`)
- `nextOccurrence`
- `endsAt` (optional)
- `status` (`active`, `paused`, or `cancelled`)
- `templateExpenseId`

### Settlement

Represents a payment that reduces a user's outstanding balance. It does not edit or delete the expenses that created the balance.

- `id`
- `fromUserId`
- `toUserId`
- `amount`
- `currency`
- `settledAt`
- `note` (optional)
- `createdBy`

## Important Rules

- Amounts must be positive and use a consistent currency and precision.
- A split cannot be assigned to a user who is not a participant.
- The payer and all participants must be known users.
- Users may edit or delete only expenses they own, unless group permissions later introduce an administrator role.
- Deleting an expense must recalculate balances and must not silently delete settlement history.
- A settlement cannot exceed the outstanding amount between the two users without an explicit overpayment rule.
- Deactivated users remain visible in historical expenses, but cannot create new activity.

## Planned Project Structure

The folders are intentionally minimal while the requirements are being defined:

```text
.
|-- README.md
|-- src/       # Application and domain implementation
`-- test/      # Playwright tests and test fixtures
```

As the implementation grows, tests should be grouped around user journeys such as account management, expense creation, splitting, recurring expenses, and settlements.

## Technology

- **Language:** TypeScript
- **Application framework:** Next.js
- **End-to-end testing:** Playwright
- **Test style:** Test-first development with user-facing acceptance scenarios
- **Database:** PostgreSQL
- **Container:** Docker with a standalone Next.js production image
- **CI/CD:** GitHub Actions with GHCR image publishing from `main`

## Development And Delivery

Run the local application with:

```bash
npm install
npm run dev
```

Run the local quality gates with:

```bash
npm run lint
npm run typecheck
npm run build
```

Start PostgreSQL for local development with:

```bash
docker compose up -d postgres
```

The local database is available on port `15432`; the application container connects to PostgreSQL over the internal Compose network.

Run the application and PostgreSQL containers locally with:

```bash
docker compose up --build
```

The application is available at `http://localhost:3200`. Keep this command running while using the application; press `Ctrl+C` only when you want to stop both containers. To run it in the background, use `docker compose up --build -d` and stop it later with `docker compose down`.

The GitHub Actions workflow in `.github/workflows/ci-cd.yml` provisions PostgreSQL, initializes the schema, and runs linting, type-checking, the production build, and the blocking Playwright acceptance suite for pull requests and pushes to `main`. It also runs the intentionally red Playwright suite and uploads reports. The Docker image is built for every validated change and is published to GitHub Container Registry when changes reach `main`.

## Suggested Acceptance Scenarios

1. A user creates an equal split for a dinner and each participant receives the correct share.
2. A payer creates a percentage split and the application rejects percentages that do not total 100%.
3. A user edits an expense and the affected balances are recalculated.
4. A user records a settlement and the outstanding balance decreases without changing the original expense.
5. A recurring schedule creates a new expense for its next occurrence.
6. An unauthorized user cannot edit or delete someone else's expense.
7. A deactivated user cannot create an expense, but remains associated with historical records.

## Author

Varshini Sundari Babu

## Date

6 September 2026
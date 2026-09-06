import { type Locator, type Page } from "@playwright/test";

export class ExpenseCreatePage {
  readonly page: Page;
  readonly description: Locator;
  readonly amount: Locator;
  readonly currency: Locator;
  readonly category: Locator;
  readonly expenseDate: Locator;
  readonly payer: Locator;
  readonly participants: Locator;
  readonly splitType: Locator;
  readonly paymentMethod: Locator;
  readonly submitButton: Locator;
  readonly alert: Locator;
  readonly status: Locator;
  readonly expenseDetails: Locator;

  constructor(page: Page) {
    this.page = page;
    this.description = page.getByLabel("Description");
    this.amount = page.getByLabel("Amount");
    this.currency = page.getByLabel("Currency");
    this.category = page.getByLabel("Category");
    this.expenseDate = page.getByLabel("Expense date");
    this.payer = page.getByLabel("Payer");
    this.participants = page.getByLabel("Participants");
    this.splitType = page.getByLabel("Split type");
    this.paymentMethod = page.getByLabel("Payment method");
    this.submitButton = page.getByRole("button", { name: /create expense|save expense|submit/i });
    this.alert = page.locator("p[role='alert']");
    this.status = page.getByRole("status");
    this.expenseDetails = page.getByRole("region", { name: /expense details/i });
  }

  async goto() {
    await this.page.goto("/expenses/new");
  }

  async fillRequired(values: {
    description: string;
    amount: string;
    currency?: string;
    category?: string;
    expenseDate?: string;
  }) {
    await this.description.fill(values.description);
    await this.amount.fill(values.amount);
    if (values.currency) await this.currency.selectOption(values.currency);
    if (values.category) await this.category.selectOption(values.category);
    if (values.expenseDate) await this.expenseDate.fill(values.expenseDate);
  }

  async selectPayer(name: string) {
    await this.payer.selectOption({ label: name });
  }

  async selectParticipants(names: string[]) {
    for (const name of names) {
      await this.participants.selectOption({ label: name });
    }
  }

  async chooseSplit(type: "equal" | "percentage" | "fixedAmount") {
    await this.splitType.selectOption(type);
  }

  async enterSplitValues(values: string[]) {
    const splitInputs = this.page.getByRole("spinbutton", { name: /share|percentage|split/i });
    for (let index = 0; index < values.length; index += 1) {
      await splitInputs.nth(index).fill(values[index]);
    }
  }

  async submit() {
    await this.submitButton.click();
  }

  async create(values: {
    description: string;
    amount: string;
    currency?: string;
    category?: string;
    expenseDate?: string;
    payer?: string;
    participants?: string[];
    splitType?: "equal" | "percentage" | "fixedAmount";
    splitValues?: string[];
    paymentMethod?: string;
  }) {
    await this.goto();
    await this.fillRequired(values);
    if (values.payer) await this.selectPayer(values.payer);
    if (values.participants) await this.selectParticipants(values.participants);
    if (values.splitType) await this.chooseSplit(values.splitType);
    if (values.splitValues) await this.enterSplitValues(values.splitValues);
    if (values.paymentMethod) await this.paymentMethod.fill(values.paymentMethod);
    await this.submit();
  }
}

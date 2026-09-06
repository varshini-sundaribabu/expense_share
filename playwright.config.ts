import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3200",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --port 3200",
    url: "http://127.0.0.1:3200",
    env: {
      DATABASE_URL: process.env.E2E_DATABASE_URL ?? "postgresql://expense_sharer:expense_sharer_dev@127.0.0.1:15432/expense_sharer",
    },
    reuseExistingServer: false,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

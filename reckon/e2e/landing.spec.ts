import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders hero section with CTAs", async ({ page }) => {
    await expect(page.getByText("Stop guessing why you're not")).toBeVisible();
    await expect(page.getByText("getting interviews")).toBeVisible();
    await expect(page.getByRole("link", { name: "Start Free — No Credit Card" })).toBeVisible();
    await expect(page.getByRole("link", { name: "See How It Works" })).toBeVisible();
  });

  test("renders navigation with Login and Sign Up", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign Up" })).toBeVisible();
  });

  test("renders stats row", async ({ page }) => {
    await expect(page.getByText("78%")).toBeVisible();
    await expect(page.getByText("3x")).toBeVisible();
    await expect(page.getByText("12k+")).toBeVisible();
  });

  test("renders 6 feature cards", async ({ page }) => {
    await page.locator("#features").scrollIntoViewIfNeeded();
    await expect(page.getByText("AI Match Score")).toBeVisible();
    await expect(page.getByText("Missing Skills Pinpointed")).toBeVisible();
    await expect(page.getByText("Personalized Opening Email")).toBeVisible();
    await expect(page.getByText("Kanban Job Tracker")).toBeVisible();
    await expect(page.getByText("ATS Risk Analysis")).toBeVisible();
    await expect(page.getByText("Paste Any Job URL")).toBeVisible();
  });

  test("renders 2 pricing cards", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByText("Pay As You Go", { exact: true })).toBeVisible();
    await expect(page.getByText("/ 12 analyses")).toBeVisible();
    await expect(page.getByText("Monthly", { exact: true })).toBeVisible();
    await expect(page.getByText("Best Value", { exact: true })).toBeVisible();
  });

  test("renders footer", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByText("AI-powered job search intelligence")).toBeVisible();
  });

  test("Start Free CTA navigates to signup", async ({ page }) => {
    await page.getByRole("link", { name: "Start Free — No Credit Card" }).click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("Login nav link navigates to login", async ({ page }) => {
    await page.getByRole("link", { name: "Login" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

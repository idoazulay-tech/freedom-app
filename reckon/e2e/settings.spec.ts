import { test, expect } from "@playwright/test";
import { mockAuth, mockApiProfile, mockApiBilling } from "./helpers/mockAuth";

test.describe("Settings Page — 4 Cards", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await mockApiProfile(page);
    await mockApiBilling(page);
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");
  });

  test("renders Profile card with name and email fields", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
    await expect(page.getByLabel("Full Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    const nameInput = page.getByLabel("Full Name");
    await expect(nameInput).toHaveValue("Test User");
    await expect(page.getByRole("button", { name: "Save Profile" })).toBeVisible();
  });

  test("renders Resume card with upload and paste options", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Resume" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Update Resume" })).toBeVisible();
    await expect(page.getByText("Upload PDF")).toBeVisible();
    await expect(page.getByText("Paste Text")).toBeVisible();
  });

  test("renders Plan and Usage card with usage bars", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Plan & Usage" })).toBeVisible();
    await expect(page.getByText(/free plan/i)).toBeVisible();
    await expect(page.getByText("Jobs Analyzed", { exact: true })).toBeVisible();
    await expect(page.getByText("Daily AI Analyses Used", { exact: true })).toBeVisible();
  });

  test("renders Billing History card", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Billing History" })).toBeVisible();
    await expect(page.getByText("No billing history yet.")).toBeVisible();
  });

  test("shows current usage values (2 of 3 jobs, 0 of 10 analyses)", async ({ page }) => {
    await expect(page.getByText("2 / 3")).toBeVisible();
    await expect(page.getByText("0 / 10")).toBeVisible();
  });

  test("shows upgrade options for free plan users", async ({ page }) => {
    await expect(page.getByText("Pay As You Go — $1 / 12 jobs")).toBeVisible();
    await expect(page.getByText("Monthly — $19/mo")).toBeVisible();
  });

  test("allows editing profile name", async ({ page }) => {
    const nameInput = page.getByLabel("Full Name");
    await nameInput.clear();
    await nameInput.fill("Updated Name");
    await expect(nameInput).toHaveValue("Updated Name");
  });

  test("sidebar renders with Dashboard and Settings links", async ({ page }) => {
    const sidebar = page.locator("nav, aside").first();
    await expect(sidebar).toBeVisible();
    await expect(page.getByRole("link", { name: "Dashboard" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" }).first()).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";
import { mockAuth, mockApiJobs, mockApiProfile, mockApiSingleJob } from "./helpers/mockAuth";

const MOCK_PROFILE = {
  profile: { id: "1", full_name: "Test", subscription_type: "free", jobs_count: 0 },
};

test.describe("Dashboard — Kanban Board", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await mockApiJobs(page);
    await mockApiProfile(page);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("renders 5 Kanban columns", async ({ page }) => {
    await expect(page.getByText("Saved", { exact: true })).toBeVisible();
    await expect(page.getByText("Applied", { exact: true })).toBeVisible();
    await expect(page.getByText("Interview", { exact: true })).toBeVisible();
    await expect(page.getByText("Offer", { exact: true })).toBeVisible();
    await expect(page.getByText("Rejected", { exact: true })).toBeVisible();
  });

  test("renders Add Job button", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Add Job" })).toBeVisible();
  });

  test("renders header with date and welcome message", async ({ page }) => {
    await expect(page.getByText("Welcome, Test")).toBeVisible();
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    await expect(page.getByText(today, { exact: false })).toBeVisible();
  });

  test("shows job cards with company names and titles", async ({ page }) => {
    await expect(page.getByText("Senior Frontend Engineer")).toBeVisible();
    await expect(page.getByText("React Developer")).toBeVisible();
    await expect(page.getByText("Acme Corp")).toBeVisible();
    await expect(page.getByText("Beta Inc")).toBeVisible();
  });

  test("shows match score badges on job cards", async ({ page }) => {
    await expect(page.getByText("82% Match")).toBeVisible();
    await expect(page.getByText("67% Match")).toBeVisible();
  });

  test("opens Add Job modal on button click with 3 tabs", async ({ page }) => {
    await page.getByRole("button", { name: "Add Job" }).click();
    await expect(page.getByText("Add New Job", { exact: true })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Paste URL" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Screenshot" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Manual" })).toBeVisible();
  });

  test("Add Job modal URL tab has job URL input", async ({ page }) => {
    await page.getByRole("button", { name: "Add Job" }).click();
    await expect(page.getByPlaceholder("https://linkedin.com/jobs/...")).toBeVisible();
    await expect(page.getByRole("button", { name: "Extract & Add Job" })).toBeVisible();
  });

  test("Add Job modal switches to Screenshot tab", async ({ page }) => {
    await page.getByRole("button", { name: "Add Job" }).click();
    await page.getByRole("tab", { name: "Screenshot" }).click();
    await expect(page.getByText("Click to upload a screenshot")).toBeVisible();
  });

  test("Add Job modal switches to Manual tab with required fields", async ({ page }) => {
    await page.getByRole("button", { name: "Add Job" }).click();
    await page.getByRole("tab", { name: "Manual" }).click();
    await expect(page.getByLabel("Company")).toBeVisible();
    await expect(page.getByLabel("Job Title")).toBeVisible();
    await expect(page.getByText("Status", { exact: true })).toBeVisible();
    await expect(page.getByText("Job Description")).toBeVisible();
  });

  test("Add Job modal closes with Escape key", async ({ page }) => {
    await page.getByRole("button", { name: "Add Job" }).click();
    await expect(page.getByText("Add New Job")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByText("Add New Job")).not.toBeVisible({ timeout: 3000 });
  });

  test("Add Job modal saves manual job and navigates to job detail", async ({ page }) => {
    await mockApiSingleJob(page, "job-1");
    await page.route("/api/jobs/job-1/analyze", (route) => {
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    await page.getByRole("button", { name: "Add Job" }).click();
    await page.getByRole("tab", { name: "Manual" }).click();
    await page.getByLabel("Company").fill("New Corp");
    await page.getByLabel("Job Title").fill("Staff Engineer");
    await page.locator('[role="dialog"]').getByRole("button", { name: "Add Job" }).click();
    await expect(page).toHaveURL(/\/jobs\/job-1/, { timeout: 8000 });
  });
});

test.describe("Dashboard — Loading and Error States", () => {
  test("shows loading spinner initially", async ({ page }) => {
    await mockAuth(page);

    let resolveJobs: (value: unknown) => void;
    const jobsHeld = new Promise((resolve) => { resolveJobs = resolve; });

    await page.route("/api/jobs", async (route) => {
      await jobsHeld;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ jobs: [] }),
      });
    });
    await page.route("/api/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PROFILE),
      });
    });

    await page.goto("/dashboard");
    await expect(page.locator(".animate-spin")).toBeVisible();
    resolveJobs!(null);
  });

  test("shows error state and Retry button when jobs API fails", async ({ page }) => {
    await mockAuth(page);
    await page.route("/api/jobs", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Server error" }),
      });
    });
    await page.route("/api/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PROFILE),
      });
    });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Failed to load your jobs")).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  });
});

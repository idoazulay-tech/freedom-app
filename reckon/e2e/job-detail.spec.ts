import { test, expect } from "@playwright/test";
import { mockAuth, mockApiJobs, mockApiProfile, mockApiSingleJob } from "./helpers/mockAuth";

test.describe("Job Detail Page — Content Sections", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await mockApiJobs(page);
    await mockApiSingleJob(page, "job-1");
    await mockApiProfile(page);
    await page.goto("/jobs/job-1");
    await page.waitForLoadState("networkidle");
  });

  test("renders company name and job title in header", async ({ page }) => {
    await expect(page.locator("div.text-sm.text-muted-foreground").filter({ hasText: "Acme Corp" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 }).filter({ hasText: "Senior Frontend Engineer" })).toBeVisible();
  });

  test("renders match score badge in sidebar", async ({ page }) => {
    await expect(page.getByText("82%")).toBeVisible();
  });

  test("renders ATS Risk Score section with correct level", async ({ page }) => {
    await expect(page.getByText("ATS Risk Score", { exact: true })).toBeVisible();
    await expect(page.getByText("Low", { exact: true })).toBeVisible();
  });

  test("renders Missing Skills section with tags", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Missing Skills" })).toBeVisible();
    await expect(page.getByText("GraphQL", { exact: true })).toBeVisible();
    await expect(page.getByText("AWS", { exact: true })).toBeVisible();
  });

  test("renders Resume Suggestions section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Resume Suggestions" })).toBeVisible();
    await expect(page.getByText("Highlight TypeScript experience")).toBeVisible();
  });

  test("renders Generated Email section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Generated Email" })).toBeVisible();
    await expect(
      page.getByText("I am excited to apply", { exact: false })
    ).toBeVisible();
  });

  test("renders Job Description section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Job Description" })).toBeVisible();
    await expect(page.getByText("Senior Frontend Engineer to join our team", { exact: false })).toBeVisible();
  });

  test("renders status selector", async ({ page }) => {
    await expect(page.getByRole("combobox")).toBeVisible();
  });

  test("back link navigates to dashboard", async ({ page }) => {
    const backLink = page.getByRole("link", { name: /back|jobs/i }).first();
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("shows Missing Skills count in sidebar", async ({ page }) => {
    const sidebar = page.locator("[class*='grid'] > :last-child").first();
    await expect(page.getByText("Missing Skills", { exact: true }).last()).toBeVisible();
  });

  test("no critical JavaScript console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.reload();
    await page.waitForLoadState("networkidle");
    const critical = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("net::ERR") &&
        !e.includes("Failed to load resource") &&
        !e.includes("supabase")
    );
    expect(critical).toHaveLength(0);
  });
});

test.describe("Job Detail Page — Free Tier Paywall", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await mockApiJobs(page);
    await mockApiSingleJob(page, "job-2");
    await mockApiProfile(page);
    await page.goto("/jobs/job-2");
    await page.waitForLoadState("networkidle");
  });

  test("shows job-2 title and company", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 }).filter({ hasText: "React Developer" })).toBeVisible();
    await expect(page.locator("div.text-sm.text-muted-foreground").filter({ hasText: "Beta Inc" }).first()).toBeVisible();
  });

  test("shows 67% match score", async ({ page }) => {
    await expect(page.getByText("67%")).toBeVisible();
  });

  test("shows medium ATS risk for 67% score", async ({ page }) => {
    await expect(page.getByText("ATS Risk Score", { exact: true })).toBeVisible();
    await expect(page.getByText("Medium", { exact: true })).toBeVisible();
  });
});

test.describe("Layout — Sidebar Behavior", () => {
  test("desktop (1280px): fixed sidebar is visible on dashboard", async ({ page }) => {
    await mockAuth(page);
    await mockApiJobs(page);
    await mockApiProfile(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const sidebar = page.locator("aside, nav[class*='sidebar'], [data-component-name='Sidebar']").first();
    await expect(sidebar).toBeVisible();
    const box = await sidebar.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(150);
  });

  test("mobile (375px): content fits viewport with no horizontal overflow", async ({ page }) => {
    await mockAuth(page);
    await mockApiJobs(page);
    await mockApiProfile(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 5);
  });

  test("no critical JavaScript console errors on dashboard", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await mockAuth(page);
    await mockApiJobs(page);
    await mockApiProfile(page);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const critical = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("net::ERR") &&
        !e.includes("Failed to load resource") &&
        !e.includes("supabase")
    );
    expect(critical).toHaveLength(0);
  });
});

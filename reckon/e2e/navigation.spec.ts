import { test, expect } from "@playwright/test";

test.describe("Protected Route Redirects", () => {
  test("dashboard redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("settings redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("job detail redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/jobs/some-job-id");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });
});

test.describe("404 Not Found", () => {
  test("unknown routes show 404 page", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-xyz");
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Return Home" })).toBeVisible();
  });
});

test.describe("Navigation Links", () => {
  test("login page has link back to signup", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("signup page has link back to login", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("landing page Logo R. is present in nav", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  });
});

test.describe("Error States", () => {
  test("login shows error toast on failed auth attempt", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email Address").fill("nonexistent@test.com");
    await page.getByLabel("Password").fill("wrongpass123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText("Error signing in", { exact: true })).toBeVisible({ timeout: 8000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

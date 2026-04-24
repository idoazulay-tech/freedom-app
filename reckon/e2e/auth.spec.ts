import { test, expect, Page } from "@playwright/test";
import { mockApiJobs, mockApiProfile } from "./helpers/mockAuth";

const SUPABASE_URL = "https://kypejbzdjfwdyzxfqgx.supabase.co";
const FAKE_USER = {
  id: "test-user-id",
  email: "test@reckon.app",
  user_metadata: { full_name: "Test User" },
  app_metadata: {},
  aud: "authenticated",
  role: "authenticated",
  created_at: new Date().toISOString(),
};
const FAKE_SESSION = {
  access_token: "fake-access-token-valid",
  token_type: "bearer",
  expires_in: 86400,
  expires_at: Math.floor(Date.now() / 1000) + 86400,
  refresh_token: "fake-refresh-token",
  user: FAKE_USER,
};

async function mockSuccessfulAuth(page: Page) {
  await page.route(`${SUPABASE_URL}/**`, async (route) => {
    const url = route.request().url();
    if (url.includes("/auth/v1/token")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(FAKE_SESSION),
      });
    } else if (url.includes("/auth/v1/user")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(FAKE_USER),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ session: FAKE_SESSION, user: FAKE_USER }),
      });
    }
  });
  await mockApiJobs(page);
  await mockApiProfile(page);
}

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("renders login form elements", async ({ page }) => {
    await expect(page.getByLabel("Email Address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText("Please enter a valid email address")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("stays on login page when invalid email submitted", async ({ page }) => {
    await page.getByLabel("Email Address").fill("notanemail");
    await page.getByLabel("Password").fill("somepassword");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows password length validation error", async ({ page }) => {
    await page.getByLabel("Email Address").fill("test@example.com");
    await page.getByLabel("Password").fill("12345");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText("Password must be at least 6 characters")).toBeVisible();
  });

  test("shows error toast on wrong credentials", async ({ page }) => {
    await page.getByLabel("Email Address").fill("test@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText("Error signing in", { exact: true })).toBeVisible({ timeout: 8000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("Sign up link navigates to signup", async ({ page }) => {
    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("successful login redirects to dashboard", async ({ page }) => {
    await mockSuccessfulAuth(page);
    await page.getByLabel("Email Address").fill("test@reckon.app");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 });
    await expect(page.getByText("Saved", { exact: true })).toBeVisible({ timeout: 8000 });
  });
});

test.describe("Signup Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
  });

  test("renders signup form elements", async ({ page }) => {
    await expect(page.getByLabel("Full Name")).toBeVisible();
    await expect(page.getByLabel("Email Address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.getByRole("button", { name: "Sign Up" }).click();
    await expect(page.getByText("Name must be at least 2 characters")).toBeVisible();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("shows name length validation error", async ({ page }) => {
    await page.getByLabel("Full Name").fill("A");
    await page.getByRole("button", { name: "Sign Up" }).click();
    await expect(page.getByText("Name must be at least 2 characters")).toBeVisible();
  });

  test("Sign in link navigates to login", async ({ page }) => {
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("successful signup redirects to dashboard", async ({ page }) => {
    await page.route(`${SUPABASE_URL}/**`, async (route) => {
      const url = route.request().url();
      if (url.includes("/auth/v1/signup")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(FAKE_SESSION),
        });
      } else if (url.includes("/auth/v1/user")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(FAKE_USER),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ session: FAKE_SESSION, user: FAKE_USER }),
        });
      }
    });
    await mockApiJobs(page);
    await mockApiProfile(page);
    await page.getByLabel("Full Name").fill("Test User");
    await page.getByLabel("Email Address").fill("newuser@reckon.app");
    await page.getByLabel("Password").fill("securepassword123");
    await page.getByRole("button", { name: "Sign Up" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 });
  });
});

import { defineConfig, devices } from "@playwright/test";

const NIXOS_CHROME_FALLBACK = "/nix/store/d7y5039fgn5432kgkn0cv09hda4a7nxz-playwright-chromium-cjk-1.55.0-1187/chrome-linux/chrome-wrapper";

function resolveChromePath(): string | undefined {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }
  try {
    const fs = require("fs");
    if (fs.existsSync(NIXOS_CHROME_FALLBACK)) return NIXOS_CHROME_FALLBACK;
    console.warn(
      "[playwright] No browser binary found. Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH or run: npx playwright install chromium"
    );
  } catch {}
  return undefined;
}

const executablePath = resolveChromePath();

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/test-results",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:18787",
    trace: "off",
    screenshot: "only-on-failure",
    video: "off",
    launchOptions: {
      ...(executablePath ? { executablePath } : {}),
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    },
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});

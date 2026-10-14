import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    // Основной таргет — телефон
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  // Гоняем собранный dist, как на проде. В CI dist приходит из job сборки, локально собираем сами
  webServer: {
    command: `${isCI ? "" : "npm run build && "}npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});

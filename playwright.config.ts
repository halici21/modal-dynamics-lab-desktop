import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/interaction",
  snapshotPathTemplate: "{testDir}/../visual/{arg}{ext}",
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:1420",
    viewport: { width: 1440, height: 900 },
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:1420",
    reuseExistingServer: true,
  },
});

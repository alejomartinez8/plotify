import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  // Prevent Vite from picking up the project's postcss.config.mjs (written
  // for Next.js/Tailwind's own tooling, not Vite's PostCSS loader) — tests
  // only run pure TS functions and never touch CSS.
  css: { postcss: { plugins: [] } },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    // Component tests render with Testing Library and need a DOM; pure
    // logic tests stay on the lighter "node" environment above.
    environmentMatchGlobs: [["src/**/*.test.tsx", "jsdom"]],
    setupFiles: ["src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**/*.{ts,tsx}"],
      exclude: [
        "src/lib/**/*.test.{ts,tsx}",
        "src/lib/translations.ts",
        "src/lib/constants.ts",
        "src/lib/prisma.ts",
        // Google Drive OAuth wrapper: thin, low-value to unit test in
        // isolation (would mean mocking the entire googleapis client).
        "src/lib/services/google-oauth-service.ts",
      ],
      thresholds: {
        statements: 50,
        branches: 65,
        functions: 60,
        lines: 50,
      },
    },
  },
});

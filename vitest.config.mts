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
    include: ["src/**/*.test.ts"],
  },
});

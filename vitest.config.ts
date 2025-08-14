import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/",
        "src/test/",
        "*.config.*",
        "**/*.d.ts",
        "**/*.test.*",
        "**/*.spec.*",
        "**/mockData/*",
        ".next/",
        "coverage/",
        "public/",
        "scripts/",
        // Exclude configuration and setup files
        "src/app/**/*", // Exclude all app directory (UI components)
        "src/components/**/*", // Exclude UI components
        "src/lib/db/schema.ts",
        "src/lib/auth/**/*", // Auth config files
        "src/types/",
        "src/hooks/",
        "src/constants/",
        "src/services/api.ts", // Basic API wrapper
        "middleware.ts",
      ],
      include: ["src/**/*.{ts,tsx}"],
      all: true,
      skipFull: false,
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
        perFile: false, // Only check global thresholds, not per file
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});

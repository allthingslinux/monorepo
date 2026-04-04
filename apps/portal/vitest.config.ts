import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@/auth": path.resolve(import.meta.dirname, "./src/features/auth/lib"),
      "@/auth/client": path.resolve(
        import.meta.dirname,
        "./src/features/auth/lib/client.ts"
      ),
      "@/config": path.resolve(import.meta.dirname, "./src/shared/config"),
      "server-only": path.resolve(
        import.meta.dirname,
        "./vitest.server-only-mock.ts"
      ),
    },
  },
  test: {
    coverage: {
      exclude: [
        "node_modules/",
        "tests/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData/**",
        "**/__tests__/**",
        ".next/**",
        "coverage/**",
        "references/**",
      ],
      include: ["src/**/*.ts", "src/**/*.tsx"],
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
    },
    environment: "jsdom",
    exclude: [
      "node_modules/**",
      "**/node_modules/**",
      "**/.next/**",
      "**/coverage/**",
      "**/references/**",
      "**/*.config.*",
      "src/**/*.test.*",
      "src/**/*.spec.*",
    ],
    globals: true,
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
});

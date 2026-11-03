import path from "node:path";
import { defineConfig } from "vitest/config";

const alias = {
  "@": path.resolve(import.meta.dirname, "src"),
  // `server-only` throws outside a React Server environment; tests run in plain Node.
  "server-only": path.resolve(import.meta.dirname, "tests/support/empty.ts"),
};

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      { resolve: { alias }, test: { name: "unit", include: ["tests/unit/**/*.test.{ts,tsx}"], environment: "node" } },
      {
        resolve: { alias },
        test: { name: "integration", include: ["tests/integration/**/*.test.{ts,tsx}"], environment: "node", testTimeout: 60_000 },
      },
    ],
  },
});

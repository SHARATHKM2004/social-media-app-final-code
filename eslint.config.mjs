import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
  ]),

  // ✅ Override rules for test files ONLY
  {
    files: [
      "**/__tests__/**/*.{js,jsx,ts,tsx}",
      "**/*.{test,spec}.{js,jsx,ts,tsx}",
    ],
    languageOptions: {
      globals: {
        // Jest globals
        describe: "readonly",
        test: "readonly",
        it: "readonly",
        expect: "readonly",
        jest: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
    rules: {
      // Tests use mocks and `any` commonly
      "@typescript-eslint/no-explicit-any": "off",

      // Tests often have helper vars that look unused
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",

      // Some tests use console
      "no-console": "off",

      // Empty callbacks are common in tests
      "@typescript-eslint/no-empty-function": "off",

      // If any "undefined" issues show up, silence them for tests
      "no-undef": "off",
    },
  },
]);

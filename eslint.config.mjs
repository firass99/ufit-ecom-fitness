import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";

// Check if this is a Next.js app
const isNext = process.cwd().includes("ecom-store");

// Base ESLint configuration
const baseConfig = {
  files: ["**/*.ts", "**/*.tsx"],
  plugins: {
    "@typescript-eslint": tseslint,
  },
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: "./tsconfig.json",
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
  ignores: ["node_modules", ".next", "dist", "build", "*.log", "app/.well-known/vercel/flags/route.ts"],
};

// Next.js-specific ESLint configuration (if detected)
let nextConfig = {};
if (isNext) {
  try {
    const nextPlugin = await import("@next/eslint-plugin-next");
    nextConfig = {
      plugins: { "@next/next": nextPlugin.default },
      rules: {
        "@next/next/no-html-link-for-pages": "off",
      },
    };
  } catch {
    console.log("Skipping Next.js ESLint rules (not installed)");
  }
}

// Export final ESLint configuration
export default [prettierConfig, baseConfig, nextConfig];

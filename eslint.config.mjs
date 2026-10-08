import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      ".agent/**",
      ".agents/**",
      "GSOC contributor hub/**",
      "contribo-app/**",
      "node_modules/**",
      "**/node_modules/**",
      "scratch/**",
      "scripts/**",
      "*.js",
      "*.mjs",
      "public/**",
    ],
  },
  ...nextVitals,
  ...nextTs,
]);

export default eslintConfig;

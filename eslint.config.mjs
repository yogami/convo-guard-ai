import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Software craftsmanship complexity rules
  {
    rules: {
      'complexity': ['warn', { max: 10 }],             // Cyclomatic complexity
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-lines': ['warn', { max: 250, skipBlankLines: true, skipComments: true }],
      'max-depth': ['warn', { max: 4 }],               // Nesting depth
      'max-params': ['warn', { max: 4 }],              // Parameter count
    }
  }
]);

export default eslintConfig;

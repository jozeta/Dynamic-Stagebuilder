// ESLint flat config. no-unsanitized blocks innerHTML/outerHTML/insertAdjacentHTML/document.write
// with unsanitized data (SEC-DOM-2); no-eval and no-implied-eval back up SEC-EVAL-1.
import js from "@eslint/js";
import nounsanitized from "eslint-plugin-no-unsanitized";
import globals from "globals";

export default [
  { ignores: ["vendor/**", "node_modules/**", "dist/**"] },
  js.configs.recommended,
  nounsanitized.configs.recommended,
  {
    languageOptions: { ecmaVersion: 2023, sourceType: "module", globals: { ...globals.browser } },
    rules: { "no-eval": "error", "no-implied-eval": "error", "no-new-func": "error" },
  },
  {
    files: ["**/*.test.*", "tests/**", "test/**"],
    languageOptions: { globals: { ...globals.node } },
  },
];

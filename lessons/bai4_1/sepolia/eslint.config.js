import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "artifacts/**",
      "cache/**",
      "coverage/**",
      "types/**",
      "data/**",
      "ignition/deployments/**",
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  { files: ["**/*.ts"], rules: { "@typescript-eslint/consistent-type-imports": "error" } },
);

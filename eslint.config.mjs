import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// eslint-config-next v16 ships native flat configs, so we spread them directly
// (no @eslint/eslintrc FlatCompat bridge needed).
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      ".emulator-data/**",
      "next-env.d.ts",
      "scripts/**",
    ],
  },
];

export default eslintConfig;

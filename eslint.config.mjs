import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default [
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      // Keep legacy demo snapshot effects visible without expanding this framework upgrade.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  { ignores: [".next/**", ".next-dev/**", ".next-ui-validation/**"] },
];

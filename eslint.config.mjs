import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    files: [
      "src/lib/supabase/queries.ts",
      "src/app/signup/page.tsx",
      "src/contexts/AuthContext.tsx",
      "src/hooks/useMatches.ts",
      "src/hooks/useGoals.ts",
      "src/hooks/useChats.ts",
      "src/components/goal-dialog.tsx",
      "src/components/sidebar.tsx",
      "src/components/chat-view.tsx",
      "src/components/feed-view.tsx",
      "src/app/dashboard/page.tsx"
    ],
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/ban-ts-ignore": "off",
    },
  },
];

export default eslintConfig;

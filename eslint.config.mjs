import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// This uses the new ESLint flat config format; it pulls in the Next.js
// recommended rules (including TypeScript rules) and sets the Next.js
// `rootDir` so `@next/eslint-plugin-next` can locate the `src/app` folder.
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    settings: {
      next: {
        rootDir: 'src',
      },
    },
  },
]);

import js from '@eslint/js';
import globals from 'globals';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import nextConfig from 'eslint-config-next/core-web-vitals';

const unusedVarsConfig = { argsIgnorePattern: '^_', varsIgnorePattern: '^_' };

const config = [
  js.configs.recommended,
  ...nextConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', unusedVarsConfig],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    languageOptions: {
      globals: globals.jest,
    },
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    rules: {
      'no-unused-vars': ['warn', unusedVarsConfig],
    },
  },
  {
    // react-hooks/set-state-in-effect is a new rule in eslint-plugin-react-hooks v5
    // (shipped with Next.js 16). Turned off; the existing useEffect reset patterns
    // in this codebase are intentional and require separate refactoring work.
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default config;

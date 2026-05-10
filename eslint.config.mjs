import js from '@eslint/js';
import globals from 'globals';
import nextConfig from 'eslint-config-next/core-web-vitals';

export default [
  js.configs.recommended,
  ...nextConfig,
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    languageOptions: {
      globals: globals.jest,
    },
  },
  {
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];

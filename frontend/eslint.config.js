import js from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginVitest from 'eslint-plugin-vitest'; // <-- 1. Import the correct plugin
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: pluginReact,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-target-blank': 'warn',
    },
  },

  {
    files: [
      '**/__tests__/**/*.{js,ts,jsx,tsx}',
      '**/*.{spec,test}.{js,ts,jsx,tsx}',
    ],
    ...pluginVitest.configs.recommended,
    rules: {
      ...pluginVitest.configs.recommended.rules,
    },
  },
]);

import eslintReact from '@eslint-react/eslint-plugin';
import js from '@eslint/js';
import tanstackRouter from '@tanstack/eslint-plugin-router';
import prettier from 'eslint-config-prettier/flat';
import perfectionist from 'eslint-plugin-perfectionist';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.output/**',
      '**/.nitro/**',
      '**/.tanstack/**',
      'apps/web/src/routeTree.gen.ts',
    ],
  },

  // ---------------------------------------------------------------- baseline
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  perfectionist.configs['recommended-natural'],
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Config files are plain ESM and outside any tsconfig project.
  {
    extends: [tseslint.configs.disableTypeChecked],
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
  },

  // -------------------------------------------------------------------- api
  {
    files: ['apps/api/**/*.ts'],
    languageOptions: { globals: globals.node },
    rules: {
      // NestJS modules are intentionally empty decorated classes.
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
    },
  },
  // -------------------------------------------------------------------- web
  {
    extends: [
      eslintReact.configs['recommended-type-checked'],
      // v7 keeps the eslintrc config at `configs.recommended`; the flat one lives here.
      reactHooks.configs.flat.recommended,
      tanstackRouter.configs['flat/recommended'],
    ],
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // Must stay last: turns off everything Prettier owns.
  prettier,
);

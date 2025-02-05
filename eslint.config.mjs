import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginImport from 'eslint-plugin-import';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: {...globals.browser, ...globals.node}, parser: '@typescript-eslint/parser' } },
  ...tseslint.configs.recommended,
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      import: pluginImport,
    },
    rules: {
      'no-console': 'warn',
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'jsx-quotes': ['error', 'prefer-single'],
      'semi': ['error', 'always'],
      'react/jsx-tag-spacing': ['error', {
        'beforeSelfClosing': 'never',
        'afterOpening': 'never',
        'beforeClosing': 'never'
      }],
      'eqeqeq': ['error', 'always'],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' }
      ],
      'no-multiple-empty-lines': ['error', { max: 1, 'maxEOF': 0, 'maxBOF': 0 }],
      'import/newline-after-import': ['error', { 'count': 1 }],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': [
        'error',
        {
          'argsIgnorePattern': '^_'
        }
      ]
    },
  },
];
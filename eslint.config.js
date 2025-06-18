const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const nxEslintPlugin = require('@nx/eslint-plugin')
const eslintImport = require('eslint-plugin-import')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const unusedImports = require('eslint-plugin-unused-imports')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = [
  {
    ignores: ['static-files/'],
  },
  {
    plugins: {
      '@nx': nxEslintPlugin,
      'unused-imports': unusedImports,
      import: eslintImport,
    },
  },

  // All Project's rules
  {
    ...js.configs.recommended,
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      react: react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',

      // TypeScript strict rules
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],

      // React antipatterns
      'react/no-unstable-nested-components': 'error',

      // Code quality rules for shorter functions
      complexity: ['error', 10],
      'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }],

      // Prevent unnecessary re-renders
      'react/jsx-no-bind': ['error', { allowArrowFunctions: true }],
    },
  },

  // React components get higher complexity limit due to ternary operators
  {
    files: ['**/*.tsx'],
    rules: {
      complexity: ['error', 15],
    },
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['../../tools/**'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-prototype-builtins': 'off',
      'react/jsx-no-useless-fragment': 'off',
      'no-irregular-whitespace': 'off',
      'no-case-declarations': 'off',
      'no-dupe-else-if': 'off',
      'jsx-a11y/accessible-emoji': 'off',
      'no-async-promise-executor': 'off',
      'no-constant-condition': 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'ethers',
              message: "Please import from '@ethersproject/module' directly to support tree-shaking.",
            },
            {
              name: 'styled-components',
              message: 'Please import from styled-components/macro.',
            },
          ],

          patterns: [
            {
              group: ['**/dist'],
              message: 'Do not import from dist/ - this is an implementation detail, and breaks tree-shaking.',
            },
            {
              group: ['!styled-components/macro'],
            },
          ],
        },
      ],
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'import/order': [
        'error',
        {
          pathGroups: [
            {
              pattern: '{react,jotai,jotai/*}',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '{@cowprotocol,@cowprotocol,@uniswap,@safe-global,@ethersproject,@web3-react}/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'legacy/**',
              group: 'external',
              position: 'after',
            },
            {
              pattern: 'modules/**',
              group: 'builtin',
              position: 'after',
            },
            {
              pattern: '{api,abis,common,constants,legacy,lib,pages,types,utils}/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          groups: ['external', 'builtin', 'internal', 'sibling', 'parent', 'object', 'index', 'type'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
        },
      ],
      'no-restricted-globals': [
        'error',
        'event',
        'name',
        'status',
        'length',
        'closed',
        'defaultStatus',
        'origin',
        'opener',
        'frames',
      ],
      'prefer-const': 'error',
      'no-unneeded-ternary': 'error',
      'no-var': 'error',
    },
  },

  // CoW Swap's rules
  {
    files: ['apps/cowswap-frontend/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-router',
              importNames: ['useNavigate'],
              message: "Please import useNavigate from our own common package instead: 'common/hooks/useNavigate'",
            },
          ],

          patterns: [
            {
              group: ['**/dist'],
              message: 'Do not import from dist/ - this is an implementation detail, and breaks tree-shaking.',
            },
            {
              group: ['!styled-components/macro'],
            },
          ],
        },
      ],
    },
  },

  ...compat.config({ extends: ['plugin:@nx/typescript'] }).map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
    rules: {},
  })),
  ...compat.config({ extends: ['plugin:@nx/javascript'] }).map((config) => ({
    ...config,
    files: ['**/*.js', '**/*.jsx'],
    rules: {},
  })),
]

const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const nextPlugin = require('@next/eslint-plugin-next')
const nxEslintPlugin = require('@nx/eslint-plugin')
const tseslint = require('@typescript-eslint/eslint-plugin')
const prettierConfig = require('eslint-config-prettier')
const eslintImport = require('eslint-plugin-import')
const pluginLingui = require('eslint-plugin-lingui')
const prettier = require('eslint-plugin-prettier')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const reactRefresh = require('eslint-plugin-react-refresh')
const unusedImports = require('eslint-plugin-unused-imports')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = [
  pluginLingui.configs['flat/recommended'],
  {
    ignores: ['static-files/', '.nx/', '**/.next/', 'build/', 'dist/'],
  },
  {
    plugins: {
      '@nx': nxEslintPlugin,
      'unused-imports': unusedImports,
      import: eslintImport,
      prettier: prettier,
    },
  },

  // All Project's rules
  {
    ...js.configs.recommended,
    files: ['**/*.ts', '**/*.tsx', '**/*.mts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint, // register @typescript-eslint rules
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
      'react-hooks/set-state-in-effect': 'off',

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
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': 'warn',
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
    files: ['**/*.{ts,tsx,js,jsx,mts}'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['../../tools/**'],
          checkDynamicDependenciesExceptions: ['@cowprotocol/analytics', '@cowprotocol/assets'],
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
      '@typescript-eslint/no-restricted-imports': [
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
            {
              name: '@1inch/permit-signed-approvals-utils',
              message: 'Please import from @cowprotocol/permit-utils.',
              allowTypeImports: true,
            },
            {
              name: '@safe-global/api-kit',
              message: 'Please use dynamic import.',
              allowTypeImports: true,
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
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ImportExpression[source.value="@1inch/permit-signed-approvals-utils"]',
          message: 'Please import dynamically from @cowprotocol/permit-utils',
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
              pattern: '{@cowprotocol,@uniswap,@safe-global,@ethersproject,@web3-react}/**',
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
              pattern: '{api,abis,common,constants,lib,pages,types,utils}/**',
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
      'import/no-internal-modules': [
        'error',
        {
          forbid: ['modules/*/**'],
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
      'prettier/prettier': 'warn',
    },
  },

  // CoW Swap's rules
  {
    files: ['apps/cowswap-frontend/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-router',
              importNames: ['useNavigate'],
              message: "Please import useNavigate from our own common package instead: 'common/hooks/useNavigate'",
            },
            {
              name: 'lottie-react',
              message: 'Please use dynamic import.',
              allowTypeImports: true,
            },
            {
              name: 'framer-motion',
              message: 'Please use dynamic import.',
              allowTypeImports: true,
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
  /**
   * Restrict modules/** imports inside common/** dir
   * @see CONTRIBUTING.md
   */
  {
    files: ['apps/cowswap-frontend/src/common/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'cowswap-frontend/modules',
              message: 'Do not import from modules inside common dir.',
            },
          ],
          patterns: ['modules/*'],
        },
      ],
    },
  },

  // Tests
  {
    files: ['**/*.test.{ts,tsx,js,jsx}'],
    rules: {
      complexity: ['error', 100],
      'max-lines-per-function': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
    },
  },

  // cow-fi Next.js config
  {
    files: ['apps/cow-fi/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-html-link-for-pages': ['error', 'apps/cow-fi/pages'],
    },
  },
  // TODO: remove this once the errors have been fixed
  {
    files: ['apps/cow-fi/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      // Ensure plugin-scoped rules remain resolvable after upstream filtering
      react: react,
      'react-hooks': reactHooks,
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': 'warn',
      'import/order': 'warn',
      'max-lines-per-function': 'warn',
      complexity: 'warn',
      'react/no-unstable-nested-components': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/purity': 'warn',
      '@next/next/no-img-element': 'warn',
      '@typescript-eslint/no-restricted-imports': 'warn',
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
  ...compat.config({ env: { jest: true } }).map((config) => ({
    ...config,
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
  })),
  { ignores: ['.next/**/*'] },
  prettierConfig,
]

const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const nxEslintPlugin = require('@nx/eslint-plugin')
const eslintImport = require('eslint-plugin-import')
const reactHooks = require('eslint-plugin-react-hooks')
const unusedImports = require('eslint-plugin-unused-imports')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = [
  {
    plugins: {
      '@nx': nxEslintPlugin,
      'react-hooks': reactHooks,
      'unused-imports': unusedImports,
      import: eslintImport,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
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
      '@typescript-eslint/no-explicit-any': 'off',
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
      'prefer-const': 'error',
      'no-unneeded-ternary': 'error',
      'no-var': 'error',
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

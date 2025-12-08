const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')

const baseConfig = require('../../eslint.config.js')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

// Nx/Next configs already add react/react-hooks plugins, which the base config
// defines too. Strip duplicates to avoid "Cannot redefine plugin" errors while
// keeping other plugins (e.g. @next/next) intact.
const nxReactNextConfigs = compat
  .extends('plugin:@nx/react-typescript', 'next', 'next/core-web-vitals')
  .map((config) => {
    if (!config.plugins) return config

    const { plugins, rules = {}, ...restConfig } = config
    const { react: _react, 'react-hooks': _reactHooks, ...filteredPlugins } = plugins

    const filteredRules = Object.fromEntries(
      Object.entries(rules).filter(
        ([ruleName]) => !ruleName.startsWith('react/') && !ruleName.startsWith('react-hooks/')
      )
    )

    const nextConfig =
      Object.keys(filteredPlugins).length > 0 ? { ...restConfig, plugins: filteredPlugins } : restConfig

    return Object.keys(filteredRules).length > 0 ? { ...nextConfig, rules: filteredRules } : nextConfig
  })

module.exports = [
  ...baseConfig,
  // TODO: remove this once the errors have been fixed
  {
    files: ['apps/cow-fi/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      // Ensure plugin-scoped rules remain resolvable after upstream filtering
      react: require('eslint-plugin-react'),
      'react-hooks': require('eslint-plugin-react-hooks'),
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
      '@next/next/no-html-link-for-pages': 'warn',
      '@next/next/no-img-element': 'warn',
      'no-restricted-imports': 'warn',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': ['error', 'apps/cow-fi/pages'],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {},
  },
  ...nxReactNextConfigs,
  ...compat.config({ env: { jest: true } }).map((config) => ({
    ...config,
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
  })),
  { ignores: ['.next/**/*'] },
]

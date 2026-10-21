import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // `_app` and `_pages` are the FSD layer names prescribed for Next.js: https://feature-sliced.design/docs/guides/tech/with-nextjs
    files: ['./src/_app/**', './src/_pages/**'],
    rules: { 'fsd/typo-in-layer-name': 'off' },
  },
])

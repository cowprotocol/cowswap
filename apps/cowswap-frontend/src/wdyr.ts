/**
 * why-did-you-render init. Must be imported first in main.tsx (dev only).
 * Requires jsxImportSource in vite.config.mts for dev.
 */
import React from 'react'

import whyDidYouRender from '@welldone-software/why-did-you-render'

if (import.meta.env.DEV) {
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  })
}

/*
If you want to use this:

1. Add `import './wdyr'` in `apps/cowswap-frontend/src/main.tsx`
2. Add `apps/cowswap-frontend/babel.config.cjs`:

module.exports = {
  presets: [
    '@nx/react/babel',
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
        development: process.env.NODE_ENV === 'development',
        importSource: '@welldone-software/why-did-you-render',
      },
    ],
  ],
}

3. `cd apps/cowswap-frontend` + `pnpm add @welldone-software/why-did-you-render`

4. In `apps/cowswap-frontend/vite.config.mts`, update react plugin to:

    react({
      plugins: [['@lingui/swc-plugin', {}]],
      ...(isProduction
        ? {}
        : {
            jsxImportSource: '@welldone-software/why-did-you-render',
          }),
    }),


*/

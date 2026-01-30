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

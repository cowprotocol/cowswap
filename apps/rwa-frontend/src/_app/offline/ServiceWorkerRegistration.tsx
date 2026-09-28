'use client'

import { type ReactNode, useEffect } from 'react'

import { normalizeError } from '@cowprotocol/common-utils/errors'

// Disabled in dev: a caching worker would serve stale HMR bundles
const IS_ENABLED = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_SW === 'true'

export function ServiceWorkerRegistration(): ReactNode {
  useEffect(() => {
    if (!IS_ENABLED || !('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').catch((err: unknown) => {
      const error = normalizeError(err)
      console.error('[rwa] Service worker registration failed', error)
    })
  }, [])

  return null
}

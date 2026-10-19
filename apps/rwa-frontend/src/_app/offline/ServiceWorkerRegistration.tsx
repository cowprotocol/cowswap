'use client'

import { type ReactNode, useEffect } from 'react'

import { normalizeError } from '@cowprotocol/common-utils/errors'

import { BASE_PATH, withBasePath } from '@/shared/config'

// Disabled in dev: a caching worker would serve stale HMR bundles
const IS_ENABLED = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_SW === 'true'

export function ServiceWorkerRegistration(): ReactNode {
  useEffect(() => {
    if (!IS_ENABLED || !('serviceWorker' in navigator)) return

    navigator.serviceWorker
      // `BASE_PATH` without the trailing slash, so it controls the home page too. Allowed by `Service-Worker-Allowed`
      .register(withBasePath(`/sw.js?v=${process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev'}`), { scope: BASE_PATH })
      .catch((err: unknown) => {
        const error = normalizeError(err)
        console.error('[rwa] Service worker registration failed', error)
      })
  }, [])

  return null
}

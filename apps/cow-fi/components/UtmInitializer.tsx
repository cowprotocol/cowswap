'use client'

import type { ReactNode } from 'react'

import { useSetupPage } from '../hooks/useSetupPage'

/**
 * Runs the UTM setup in isolation.
 *
 * `useSearchParams()` (used by the UTM hook) opts everything above the nearest `<Suspense>` boundary out of
 * server rendering. Keeping the hook in this render-nothing component, wrapped in its own `<Suspense>`,
 * limits the client-only part to this component so the rest of the page is rendered on the server.
 */
export function UtmInitializer(): ReactNode {
  useSetupPage()

  return null
}

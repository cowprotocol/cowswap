import { useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useMemo } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import { useFlags } from 'launchdarkly-react-client-sdk'

export interface FeatureFlags {
  isPriceChartEnabled?: boolean
  isTwapEoaEnabled?: boolean
  isSolanaEnabled?: boolean
  isAlphaNetworksOptionVisible?: boolean
  isSolanaSponsoredOrdersEnabled?: boolean
  isAtaCreationDisabled?: boolean
  isWaitForCowsEnabled?: boolean

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

declare global {
  interface Window {
    __COWSWAP_E2E_FEATURE_FLAGS__?: FeatureFlags
  }
}

// const defaults: Partial<FeatureFlags> = {
// }

// Solana is not supported in the widget yet (e.g. partner fees)
const WIDGET_FLAG_OVERRIDES: Partial<FeatureFlags> = {
  isSolanaEnabled: false,
}

/** User opt-in from the app menu, only honoured while `isAlphaNetworksOptionVisible` shows that setting */
export const alphaNetworksEnabledAtom = atomWithStorage<boolean>('alphaNetworksEnabled:v0', false, undefined, {
  getOnInit: true,
})

export function useFeatureFlags(): FeatureFlags {
  const flags = useFlags<FeatureFlags>()
  const areAlphaNetworksEnabled = useAtomValue(alphaNetworksEnabledAtom)

  // e2e tests can't get LaunchDarkly to resolve real flag values (no client-side ID is configured
  // for that environment, so the SDK never even attempts the flag-evaluation request) — they set
  // this directly on `window` instead, bypassing LaunchDarkly entirely. See
  // `apps/cowswap-e2e-tests/src/mocks/launchDarkly.ts`. Memoized so the e2e override doesn't hand
  // consumers a new object identity on every render.
  const e2eOverrideFlags = useMemo(() => {
    if (typeof window === 'undefined' || !window.__COWSWAP_E2E_FEATURE_FLAGS__) return undefined
    return { ...flags, ...window.__COWSWAP_E2E_FEATURE_FLAGS__ }
  }, [flags])

  const resolvedFlags = e2eOverrideFlags ?? flags

  return useMemo(() => {
    // The LD flag turns Solana on for everyone; while it's off, users can still opt in via alpha networks.
    // Resolved here so every Solana gate (chain lists, quotes, boot-time wallet config) follows the same value.
    const isSolanaEnabled =
      !!resolvedFlags.isSolanaEnabled || (!!resolvedFlags.isAlphaNetworksOptionVisible && areAlphaNetworksEnabled)

    return { ...resolvedFlags, isSolanaEnabled, ...(isInjectedWidget() ? WIDGET_FLAG_OVERRIDES : undefined) }
  }, [resolvedFlags, areAlphaNetworksEnabled])
  // return { ...defaults, ...flags }
}

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
  isAlphaNetworksOptionVisible: false,
}

export function useFeatureFlags(): FeatureFlags {
  const flags = useFlags<FeatureFlags>()

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

  return useMemo(
    () => (isInjectedWidget() ? { ...resolvedFlags, ...WIDGET_FLAG_OVERRIDES } : resolvedFlags),
    [resolvedFlags],
  )
  // return { ...defaults, ...flags }
}

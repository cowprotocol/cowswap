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
  isSolanaAppDataEnabled?: boolean
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
  // A build-time literal in the bundle, so this is a stable dependency.
  const envFlagsRaw = process.env.REACT_APP_FEATURE_FLAGS

  // e2e tests can't get LaunchDarkly to resolve real flag values (no client-side ID is configured
  // for that environment, so the SDK never even attempts the flag-evaluation request) — they set
  // this directly on `window` instead, bypassing LaunchDarkly entirely. See
  // `apps/cowswap-e2e-tests/src/mocks/launchDarkly.ts`. Memoized so the overrides don't hand
  // consumers a new object identity on every render.
  const overriddenFlags = useMemo(() => {
    const envFlags = parseEnvFlagOverrides(envFlagsRaw)
    const e2eFlags = typeof window === 'undefined' ? undefined : window.__COWSWAP_E2E_FEATURE_FLAGS__

    if (!envFlags && !e2eFlags) return undefined

    return { ...flags, ...envFlags, ...e2eFlags }
  }, [flags, envFlagsRaw])

  const resolvedFlags = overriddenFlags ?? flags

  return useMemo(
    () => (isInjectedWidget() ? { ...resolvedFlags, ...WIDGET_FLAG_OVERRIDES } : resolvedFlags),
    [resolvedFlags],
  )
  // return { ...defaults, ...flags }
}

/**
 * Build-time flag overrides for environments with no LaunchDarkly client-side ID, where the SDK
 * never attempts a flag evaluation and every flag stays `undefined` — local dev above all, e.g.
 * `REACT_APP_FEATURE_FLAGS='{"isSolanaEnabled":true}'` in `.env.local`. The counterpart
 * `REACT_APP_BOOT_FEATURE_FLAGS` only covers the few flags read before React exists.
 */
function parseEnvFlagOverrides(raw: string | undefined): FeatureFlags | undefined {
  if (!raw) return undefined

  try {
    return JSON.parse(raw) as FeatureFlags
  } catch {
    return undefined
  }
}

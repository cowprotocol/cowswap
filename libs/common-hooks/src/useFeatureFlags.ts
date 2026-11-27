import { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

export interface FeatureFlags {
  isPriceChartEnabled?: boolean
  isTwapEoaEnabled?: boolean
  isSolanaSponsoredOrdersEnabled?: boolean
  isWaitForCowsEnabled?: boolean
  /** Master switch for the graffiti wall: the page, the menu entry, the banner and the theme. */
  isGraffitiWallEnabled?: boolean
  /** The graffiti wall's theme, on its own narrower dial. Named for the Solana launch it shipped with. */
  isSolanaThemeEnabled?: boolean

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

  return overriddenFlags ?? flags
  // return { ...defaults, ...flags }
}

/**
 * Build-time flag overrides for environments with no LaunchDarkly client-side ID, where the SDK
 * never attempts a flag evaluation and every flag stays `undefined` — local dev above all, e.g.
 * `REACT_APP_FEATURE_FLAGS='{"isWaitForCowsEnabled":true}'` in `.env.local`.
 */
function parseEnvFlagOverrides(raw: string | undefined): FeatureFlags | undefined {
  if (!raw) return undefined

  try {
    return JSON.parse(raw) as FeatureFlags
  } catch {
    return undefined
  }
}

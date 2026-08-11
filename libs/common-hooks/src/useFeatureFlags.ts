import { useFlags } from 'launchdarkly-react-client-sdk'

export interface FeatureFlags {
  isTwapEoaEnabled?: boolean

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

  // e2e tests can't get LaunchDarkly to resolve real flag values (no client-side ID is configured
  // for that environment, so the SDK never even attempts the flag-evaluation request) — they set
  // this directly on `window` instead, bypassing LaunchDarkly entirely. See
  // `apps/cowswap-e2e-tests/src/mocks/launchDarkly.ts`.
  if (typeof window !== 'undefined' && window.__COWSWAP_E2E_FEATURE_FLAGS__) {
    return { ...flags, ...window.__COWSWAP_E2E_FEATURE_FLAGS__ }
  }

  return flags
  // return { ...defaults, ...flags }
}

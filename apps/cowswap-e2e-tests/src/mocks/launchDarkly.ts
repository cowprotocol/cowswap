import type { BrowserContext } from '@playwright/test'

/**
 * `BridgeProvidersUpdater` keeps every bridge provider except Bungee disabled until all three
 * `is*BridgeProviderEnabled` flags resolve to an actual boolean (see
 * `entities/bridgeProvider/BridgeProvidersUpdater.ts`) — with no LaunchDarkly client-side ID
 * configured in this suite's env, the real SDK never even attempts the flag-evaluation request
 * (confirmed by tracing network traffic: only a `/sdk/goals/` call fires, never `/sdk/evalx/...`),
 * so those flags never resolve and Near Intents/Across can never turn on. Rather than mock
 * LaunchDarkly's network calls, `useFeatureFlags` (`libs/common-hooks/src/useFeatureFlags.ts`)
 * reads `window.__COWSWAP_E2E_FEATURE_FLAGS__` directly and merges it over the (permanently
 * unresolved) real flags — set here via `context.addInitScript`, so it's in place before the
 * app's first render, no network round-trip or race to win.
 *
 * Bungee itself doesn't need any of this: it's added to the provider set synchronously at module
 * load (`tradingSdk/bridgingSdk.ts`), before flags ever matter.
 */
export interface LaunchDarklyMock {
  setFlag(key: string, value: boolean): Promise<void>
  reset(): Promise<void>
}

const DEFAULT_FLAGS: Readonly<Record<string, boolean>> = {
  isBungeeBridgeProviderEnabled: true,
  isNearIntentsBridgeProviderEnabled: true,
  isAcrossBridgeProviderEnabled: false,
}

export function installLaunchDarkly(context: BrowserContext): LaunchDarklyMock {
  let flags: Record<string, boolean> = { ...DEFAULT_FLAGS }

  async function applyInitScript(): Promise<void> {
    await context.addInitScript((flagsToApply: Record<string, boolean>) => {
      ;(
        window as unknown as { __COWSWAP_E2E_FEATURE_FLAGS__?: Record<string, boolean> }
      ).__COWSWAP_E2E_FEATURE_FLAGS__ = flagsToApply
    }, flags)
  }

  return {
    async setFlag(key, value) {
      flags = { ...flags, [key]: value }
      await applyInitScript()
    },
    async reset() {
      flags = { ...DEFAULT_FLAGS }
      await applyInitScript()
    },
  }
}

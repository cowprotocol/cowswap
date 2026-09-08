export type FeatureFlags = Record<string, FeatureFlagValue>

export type FeatureFlagValue = boolean | number | undefined

const BOOT_FEATURE_FLAGS_KEY = 'cowSwap.bootFeatureFlags'

interface BootFeatureFlags {
  isSolanaEnabled?: boolean
}

/**
 * Persists the subset of LaunchDarkly flags needed before the LD client exists — e.g. at
 * module-load time, for the Reown/wagmi wallet config (see `getBootFeatureFlag`) — and reloads
 * the page once if LD just resolved a value different from the one this page already booted
 * with, since code like the wallet config only reads it at module load and won't otherwise pick
 * up the change until the next navigation. Called by `FeatureFlagsUpdater` once LD resolves.
 *
 * This also fires for a brand-new session with nothing persisted yet — `IS_SOLANA_ENABLED`
 * defaults to `false`, so a session LD resolves to `true` reloads once too, not only a value
 * that changes mid-visit.
 */
export function syncBootFeatureFlags(flags: BootFeatureFlags, reload: () => void = () => location.reload()): void {
  if (typeof localStorage === 'undefined') return

  const isSolanaEnabled = Boolean(flags.isSolanaEnabled)
  const bootFlagChanged = isSolanaEnabled !== IS_SOLANA_ENABLED

  try {
    localStorage.setItem(BOOT_FEATURE_FLAGS_KEY, JSON.stringify({ isSolanaEnabled }))
  } catch {
    // Storage write failed (quota exceeded, blocked, etc.) — skip the reload too, otherwise
    // the boot flag can never catch up and this would reload on every subsequent load.
    return
  }

  if (bootFlagChanged && typeof location !== 'undefined') {
    reload()
  }
}

/**
 * Resolves a LaunchDarkly-backed flag synchronously, for bootstrapping code that runs before
 * React (and the LD client) exist. Falls back to the value `syncBootFeatureFlags` cached from
 * a previous session, then to `false`.
 */
function getBootFeatureFlag(key: keyof BootFeatureFlags): boolean {
  return getE2eFlagOverride(key) ?? readPersistedBootFlags()[key] ?? false
}

function getE2eFlagOverride(key: keyof BootFeatureFlags): boolean | undefined {
  if (typeof window === 'undefined') return undefined

  const overrides = (window as { __COWSWAP_E2E_FEATURE_FLAGS__?: Record<string, unknown> })
    .__COWSWAP_E2E_FEATURE_FLAGS__

  if (!overrides || !(key in overrides)) return undefined

  return Boolean(overrides[key])
}

function readPersistedBootFlags(): BootFeatureFlags {
  if (typeof localStorage === 'undefined') return {}

  try {
    return JSON.parse(localStorage.getItem(BOOT_FEATURE_FLAGS_KEY) || '{}')
  } catch {
    return {}
  }
}

export const IS_SOLANA_ENABLED = getBootFeatureFlag('isSolanaEnabled')

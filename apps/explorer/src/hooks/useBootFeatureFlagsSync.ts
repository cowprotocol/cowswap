import { useLayoutEffect } from 'react'

import { syncBootFeatureFlags } from '@cowprotocol/common-const'

import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk'

type BootFeatureFlags = {
  isSolanaEnabled?: boolean
}

/**
 * Persists the LaunchDarkly flags that are needed before LaunchDarkly exists.
 *
 * Most flags are read inside React once the client resolves — see {@link useSolversFeatureFlag},
 * which gates a route on `isSolversEnabled`. `IS_SOLANA_ENABLED` cannot work that way: it is
 * consumed at module load, where `CHAIN_INFO_ARRAY` decides whether Solana gets a URL prefix at
 * all, and a module-level constant cannot wait on an async client. The value therefore has to be
 * on disk before the page loads, which is what `syncBootFeatureFlags` arranges — reloading once
 * when what LaunchDarkly resolved differs from what this page booted with.
 *
 * Without this bridge the explorer never consults LaunchDarkly for that flag: its only input is a
 * cache nothing here writes, so Solana cannot be switched on in any environment, deployed or local.
 */
export function useBootFeatureFlagsSync(): void {
  const client = useLDClient()
  const flags = useFlags() as BootFeatureFlags

  // Before paint, so a reload is not preceded by a frame rendered from the stale value.
  useLayoutEffect(() => {
    // No client means LaunchDarkly has not resolved yet. Writing now would persist `false` and
    // undo a previously resolved `true` on every visit.
    if (!client) return

    syncBootFeatureFlags(flags)
  }, [client, flags])
}

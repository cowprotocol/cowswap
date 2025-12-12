import { useSetAtom } from 'jotai'
import { useLayoutEffect } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { featureFlagsAtom, featureFlagsHydratedAtom } from '../state/featureFlagsState'

export function FeatureFlagsUpdater(): null {
  const setFeatureFlags = useSetAtom(featureFlagsAtom)
  const setFeatureFlagsHydrated = useSetAtom(featureFlagsHydratedAtom)
  const flags = useFeatureFlags()

  // Log on every render
  console.log('📊 [FeatureFlagsUpdater] Render:', {
    flags: JSON.stringify(flags),
    flagsKeys: Object.keys(flags),
    isChristmasEnabled: flags.isChristmasEnabled,
  })

  // Hydrate flags before first paint to avoid default theme flash
  useLayoutEffect(() => {
    console.log('🔄 [FeatureFlagsUpdater] useLayoutEffect running:', {
      flags: JSON.stringify(flags),
      flagsKeys: Object.keys(flags),
      isChristmasEnabled: flags.isChristmasEnabled,
    })

    setFeatureFlags(flags)
    setFeatureFlagsHydrated(true)

    console.log('✅ [FeatureFlagsUpdater] Flags hydrated:', {
      flags: JSON.stringify(flags),
    })
  }, [setFeatureFlags, setFeatureFlagsHydrated, flags])

  return null
}

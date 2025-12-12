import { useSetAtom } from 'jotai'
import { useLayoutEffect } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { featureFlagsAtom, featureFlagsHydratedAtom } from '../state/featureFlagsState'

export function FeatureFlagsUpdater(): null {
  const setFeatureFlags = useSetAtom(featureFlagsAtom)
  const setFeatureFlagsHydrated = useSetAtom(featureFlagsHydratedAtom)
  const flags = useFeatureFlags()

  // Hydrate flags before first paint to avoid default theme flash
  useLayoutEffect(() => {
    setFeatureFlags(flags)
    setFeatureFlagsHydrated(true)
  }, [setFeatureFlags, setFeatureFlagsHydrated, flags])

  return null
}

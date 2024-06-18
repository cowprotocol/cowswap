import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { featureFlagsAtom } from '../state/featureFlagsState'

export function FeatureFlagsUpdater() {
  const setFeatureFlags = useSetAtom(featureFlagsAtom)
  const flags = useFeatureFlags()

  useMemo(() => {
    setFeatureFlags(flags)
  }, [setFeatureFlags, flags])

  return null
}

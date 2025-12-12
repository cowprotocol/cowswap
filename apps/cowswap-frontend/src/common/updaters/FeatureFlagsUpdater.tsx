import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { featureFlagsAtom } from '../state/featureFlagsState'

export function FeatureFlagsUpdater(): null {
  const setFeatureFlags = useSetAtom(featureFlagsAtom)
  const flags = useFeatureFlags()

  useEffect(() => {
    setFeatureFlags(flags)
  }, [setFeatureFlags, flags])

  return null
}

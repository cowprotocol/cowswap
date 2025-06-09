import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { featureFlagsAtom } from '../state/featureFlagsState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function FeatureFlagsUpdater() {
  const setFeatureFlags = useSetAtom(featureFlagsAtom)
  const flags = useFeatureFlags()

  useMemo(() => {
    setFeatureFlags(flags)
  }, [setFeatureFlags, flags])

  return null
}

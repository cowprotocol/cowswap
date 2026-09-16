import { useSetAtom } from 'jotai'
import { useLayoutEffect } from 'react'

import { syncBootFeatureFlags } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { useLDClient, useLDClientError } from 'launchdarkly-react-client-sdk'

import { featureFlagsAtom, featureFlagsStatusAtom } from '../state/featureFlagsState'

const FEATURE_FLAGS_TIMEOUT_MS = 5_000

export function FeatureFlagsUpdater(): null {
  const setFeatureFlags = useSetAtom(featureFlagsAtom)
  const setFeatureFlagsStatus = useSetAtom(featureFlagsStatusAtom)
  const flags = useFeatureFlags()
  const client = useLDClient()
  const clientError = useLDClientError()

  // Copy resolved flags before paint so consumers can switch from LD to Jotai without a flash.
  useLayoutEffect(() => {
    if (client) {
      setFeatureFlags(flags)
      setFeatureFlagsStatus(clientError ? 'unavailable' : 'ready')
      syncBootFeatureFlags(flags)
      return
    }

    const timeout = window.setTimeout(() => {
      setFeatureFlags({})
      setFeatureFlagsStatus('unavailable')
    }, FEATURE_FLAGS_TIMEOUT_MS)

    return () => window.clearTimeout(timeout)
  }, [client, clientError, flags, setFeatureFlags, setFeatureFlagsStatus])

  return null
}

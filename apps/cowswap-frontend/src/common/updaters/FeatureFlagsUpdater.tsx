import { useSetAtom } from 'jotai'
import { useLayoutEffect } from 'react'

import { syncBootFeatureFlags } from '@cowprotocol/common-const'
import { useFeatureFlags, useIsSolanaAvailable } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import { useLDClient, useLDClientError } from 'launchdarkly-react-client-sdk'

import { featureFlagsAtom, featureFlagsStatusAtom } from '../state/featureFlagsState'

const FEATURE_FLAGS_TIMEOUT_MS = 5_000

export function FeatureFlagsUpdater(): null {
  const setFeatureFlags = useSetAtom(featureFlagsAtom)
  const setFeatureFlagsStatus = useSetAtom(featureFlagsStatusAtom)
  const flags = useFeatureFlags()
  const isSolanaAvailable = useIsSolanaAvailable()
  const client = useLDClient()
  const clientError = useLDClientError()

  // Copy resolved flags before paint so consumers can switch from LD to Jotai without a flash.
  useLayoutEffect(() => {
    if (client) {
      setFeatureFlags(flags)
      setFeatureFlagsStatus(clientError ? 'unavailable' : 'ready')
      // Widget flags have Solana forced off, persisting them would leak into the app on the same origin
      if (!isInjectedWidget()) syncBootFeatureFlags({ isSolanaEnabled: isSolanaAvailable })
      return
    }

    const timeout = window.setTimeout(() => {
      setFeatureFlags({})
      setFeatureFlagsStatus('unavailable')
    }, FEATURE_FLAGS_TIMEOUT_MS)

    return () => window.clearTimeout(timeout)
  }, [client, clientError, flags, isSolanaAvailable, setFeatureFlags, setFeatureFlagsStatus])

  return null
}

import { useMemo } from 'react'

import SafeAppsSDK from '@safe-global/safe-apps-sdk'

import { useConnectionType } from './useConnectionType'

import { ConnectionType } from '../../api/types'

const sdk = new SafeAppsSDK()

export function useSafeAppsSdk(): SafeAppsSDK | null {
  const connectionType = useConnectionType()

  return useMemo(() => (connectionType === ConnectionType.GNOSIS_SAFE ? sdk : null), [connectionType])
}

import { useEffect, useState } from 'react'

import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import type SafeAppsSDK from '@safe-global/safe-apps-sdk'

export function useSafeAppsSdk(): SafeAppsSDK | null {
  const { connected: isConnectedThroughSafeApp, sdk } = useSafeAppsSDK()
  const [safeAppsSdk, setSafeAppsSdk] = useState<SafeAppsSDK | null>(null)

  useEffect(() => {
    if (!isConnectedThroughSafeApp) {
      setSafeAppsSdk(null)
    } else {
      setSafeAppsSdk(sdk)
    }
  }, [isConnectedThroughSafeApp, sdk])

  return safeAppsSdk
}

import SafeAppsSDK from '@safe-global/safe-apps-sdk'
import { useEffect, useState } from 'react'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import { useWeb3React } from '@web3-react/core'

export function useSafeAppsSdk(): SafeAppsSDK | null {
  const [safeAppsSdk, setSafeAppsSdk] = useState<SafeAppsSDK | null>(null)
  const { connector, isActive } = useWeb3React()

  useEffect(() => {
    if (!isActive || !(connector instanceof GnosisSafe) || !connector.sdk) {
      setSafeAppsSdk(null)
    } else {
      setSafeAppsSdk(connector.sdk)
    }
  }, [isActive, connector])

  return safeAppsSdk
}

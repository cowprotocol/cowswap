import { useMemo } from 'react'

import SafeAppsSDK from '@safe-global/safe-apps-sdk'

import { useIsSafeApp } from './useWalletMetadata'

const sdk = new SafeAppsSDK()

export function useSafeAppsSdk(): SafeAppsSDK | null {
  const isSafeApp = useIsSafeApp()

  return useMemo(() => {
    return isSafeApp ? sdk : null
  }, [isSafeApp])
}

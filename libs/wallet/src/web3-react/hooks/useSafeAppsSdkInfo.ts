import { useEffect, useState } from 'react'

import type { SafeInfo } from '@safe-global/safe-apps-sdk'

import { useSafeAppsSdk } from './useSafeAppsSdk'

export type GnosisSafeSdkInfo = SafeInfo

export function useSafeAppsSdkInfo(): GnosisSafeSdkInfo | null {
  const [gnosisSafeInfo, setGnosisSafeInfo] = useState<GnosisSafeSdkInfo | null>(null)
  const safeAppsSdk = useSafeAppsSdk()

  useEffect(() => {
    if (!safeAppsSdk) {
      setGnosisSafeInfo(null)
    } else {
      safeAppsSdk.safe.getInfo().then(setGnosisSafeInfo)
    }
  }, [safeAppsSdk])

  return gnosisSafeInfo
}

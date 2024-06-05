import { useEffect, useState } from 'react'

import type { SafeInfo } from '@safe-global/safe-apps-sdk'

import { useSafeAppsSdk } from './useSafeAppsSdk'

export type GnosisSafeSdkInfo = SafeInfo

export function useSafeAppsSdkInfo(): GnosisSafeSdkInfo | null {
  const [gnosisSafeInfo, setGnosisSafeInfo] = useState<GnosisSafeSdkInfo | null>(null)
  const safeAppsSdk = useSafeAppsSdk()
  const [intervalTimeout, setIntervalTimeout] = useState<number>(2000)

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!safeAppsSdk) {
        setGnosisSafeInfo(null)
      } else {
        safeAppsSdk.safe.getInfo().then((safeInfo) => {
          setGnosisSafeInfo(safeInfo)
          // if the user is connected, we can check less frequently
          setIntervalTimeout(safeInfo.isReadOnly ? 10000 : 2000)
        })
      }
    }, intervalTimeout)

    return () => clearInterval(intervalId)
  }, [safeAppsSdk, intervalTimeout])

  return gnosisSafeInfo
}

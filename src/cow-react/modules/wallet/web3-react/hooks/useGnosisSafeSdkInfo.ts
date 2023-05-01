import { useEffect, useState } from 'react'

import { GnosisSafe } from '@web3-react/gnosis-safe'
import { Connector } from '@web3-react/types'
import type { SafeInfo } from '@safe-global/safe-apps-sdk'

export type GnosisSafeSdkInfo = SafeInfo

export function useGnosisSafeSdkInfo(connector: Connector, active?: boolean): GnosisSafeSdkInfo | null {
  const [gnosisSafeInfo, setGnosisSafeInfo] = useState<GnosisSafeSdkInfo | null>(null)

  useEffect(() => {
    if (!active || !(connector instanceof GnosisSafe)) {
      setGnosisSafeInfo(null)
    } else {
      connector.sdk?.safe.getInfo().then(setGnosisSafeInfo)
    }
  }, [active, connector])

  return gnosisSafeInfo
}

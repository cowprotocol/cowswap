import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'

import { GnosisSafe } from '@web3-react/gnosis-safe'
import { GnosisSafeSdkInfo, useWalletInfo } from '@cow/modules/wallet'

export function useGnosisSafeSdkInfo(): GnosisSafeSdkInfo | null {
  const [gnosisSafeInfo, setGnosisSafeInfo] = useState<GnosisSafeSdkInfo | null>(null)
  const { connector } = useWeb3React()
  const { active: isActive } = useWalletInfo()

  useEffect(() => {
    if (!isActive || !(connector instanceof GnosisSafe)) {
      setGnosisSafeInfo(null)
    } else {
      connector.sdk?.safe.getInfo().then(setGnosisSafeInfo)
    }
  }, [isActive, connector])

  return gnosisSafeInfo
}

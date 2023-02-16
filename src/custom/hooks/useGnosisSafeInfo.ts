import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import type { SafeInfo } from '@gnosis.pm/safe-apps-sdk'
import { GnosisSafe } from '@web3-react/gnosis-safe'

export function useGnosisSafeInfo(): SafeInfo | null {
  const [gnosisSafeInfo, setGnosisSafeInfo] = useState<SafeInfo | null>(null)
  const { isActive, connector } = useWeb3React()

  useEffect(() => {
    if (!isActive || !(connector instanceof GnosisSafe)) {
      setGnosisSafeInfo(null)
    } else {
      connector.sdk?.safe.getInfo().then(setGnosisSafeInfo)
    }
  }, [isActive, connector])

  return gnosisSafeInfo
}

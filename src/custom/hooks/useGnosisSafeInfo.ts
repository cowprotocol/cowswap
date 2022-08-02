import { useWeb3React } from 'web3-react-core'
import { useEffect, useState } from 'react'
import { gnosisSafe } from 'connectors'
import { SafeInfo } from '@gnosis.pm/safe-apps-sdk'

export function useGnosisSafeInfo(): SafeInfo | null {
  const [gnosisSafeInfo, setGnosisSafeInfo] = useState<SafeInfo | null>(null)
  const { active, connector } = useWeb3React()

  useEffect(() => {
    if (!active || connector !== gnosisSafe) {
      setGnosisSafeInfo(null)
    } else {
      gnosisSafe.getSafeInfo().then(setGnosisSafeInfo)
    }
  }, [active, connector])

  return gnosisSafeInfo
}

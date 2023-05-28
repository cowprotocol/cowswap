import { useEffect, useState } from 'react'

import Safe from '@safe-global/protocol-kit'
import { useWeb3React } from '@web3-react/core'

import { useIsSafeWallet, useWalletInfo } from 'modules/wallet'

import { createSafeSdkInstance } from 'api/gnosisSafe'

export function useSafeSdk(): Safe | null {
  const [safeSdk, setSafeSdk] = useState<Safe | null>(null)
  const { account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const { provider } = useWeb3React()

  useEffect(() => {
    async function getInstance(): Promise<void> {
      if (isSafeWallet && provider && account) {
        setSafeSdk(await createSafeSdkInstance(account, provider))
      } else {
        setSafeSdk(null)
      }
    }

    getInstance()
  }, [account, isSafeWallet, provider])

  return safeSdk
}

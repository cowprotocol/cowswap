import Safe from '@safe-global/protocol-kit'
import { useEffect, useState } from 'react'
import { useIsSafeWallet, useWalletInfo } from '@cow/modules/wallet'
import { useWeb3React } from '@web3-react/core'
import { createSafeSdkInstance } from '@cow/api/gnosisSafe'

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

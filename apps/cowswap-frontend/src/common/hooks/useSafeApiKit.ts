import { useEffect, useState } from 'react'

import { createSafeApiKitInstance } from '@cowprotocol/core'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'
import SafeApiKit from '@safe-global/api-kit'
import { useWeb3React } from '@web3-react/core'

export function useSafeApiKit(): SafeApiKit | null {
  const [safeApiClient, setSafeApiClient] = useState<SafeApiKit | null>(null)
  const { chainId } = useWalletInfo()
  const { provider } = useWeb3React()
  const isSafeWallet = useIsSafeWallet()

  useEffect(() => {
    if (provider && chainId && isSafeWallet) {
      setSafeApiClient(createSafeApiKitInstance(chainId, provider))
    } else {
      setSafeApiClient(null)
    }
  }, [chainId, isSafeWallet, provider])

  return safeApiClient
}

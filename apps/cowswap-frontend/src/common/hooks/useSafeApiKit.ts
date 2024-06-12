import { useEffect, useState } from 'react'

import { createSafeApiKitInstance } from '@cowprotocol/core'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import SafeApiKit from '@safe-global/api-kit'

export function useSafeApiKit(): SafeApiKit | null {
  const [safeApiClient, setSafeApiClient] = useState<SafeApiKit | null>(null)
  const { chainId } = useWalletInfo()
  const provider = useWalletProvider()
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

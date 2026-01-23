import { useEffect, useState } from 'react'

import { createSafeApiKitInstance } from '@cowprotocol/core'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'
import SafeApiKit from '@safe-global/api-kit'

export function useSafeApiKit(): SafeApiKit | null {
  const [safeApiClient, setSafeApiClient] = useState<SafeApiKit | null>(null)
  const { chainId } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()

  useEffect(() => {
    if (chainId && isSafeWallet) {
      setSafeApiClient(createSafeApiKitInstance(chainId))
    } else {
      setSafeApiClient(null)
    }
  }, [chainId, isSafeWallet])

  return safeApiClient
}

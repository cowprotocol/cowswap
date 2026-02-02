import { useRef, useState } from 'react'

import { createSafeApiKitInstance } from '@cowprotocol/core'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'
import type SafeApiKit from '@safe-global/api-kit'

import { useAsyncEffect } from './useAsyncEffect'

export function useSafeApiKit(): SafeApiKit | null {
  const [safeApiClient, setSafeApiClient] = useState<SafeApiKit | null>(null)
  const { chainId } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()

  const lastRequestedChainId = useRef<number | null>(null)

  useAsyncEffect(async () => {
    lastRequestedChainId.current = chainId || null

    if (chainId && isSafeWallet) {
      const safeApiKit = await createSafeApiKitInstance(chainId)

      if (chainId === lastRequestedChainId.current) {
        setSafeApiClient(safeApiKit)
      }
    } else {
      setSafeApiClient(null)
    }
  }, [chainId, isSafeWallet])

  return safeApiClient
}

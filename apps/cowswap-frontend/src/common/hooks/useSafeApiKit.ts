import { useEffect, useState } from 'react'

import { createSafeApiKitInstance } from '@cowprotocol/core'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'
import type SafeApiKit from '@safe-global/api-kit'
import {useAsyncEffect} from './useAsyncEffect'

export function useSafeApiKit(): SafeApiKit | null {
  const [safeApiClient, setSafeApiClient] = useState<SafeApiKit | null>(null)
  const { chainId } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()

  useAsyncEffect(async () => {
    if (chainId && isSafeWallet) {
      setSafeApiClient(await createSafeApiKitInstance(chainId))
    } else {
      setSafeApiClient(null)
    }
  }, [chainId, isSafeWallet])

  return safeApiClient
}

import { useEffect, useState } from 'react'
import { useWalletInfo } from '@cow/modules/wallet'
import { useWeb3React } from '@web3-react/core'
import { createSafeApiKitInstance } from '@cow/api/gnosisSafe'
import SafeApiKit from '@safe-global/api-kit'

export function useSafeApiKit(): SafeApiKit | null {
  const [safeApiClient, setSafeApiClient] = useState<SafeApiKit | null>(null)
  const { chainId } = useWalletInfo()
  const { provider } = useWeb3React()

  useEffect(() => {
    if (provider && chainId) {
      setSafeApiClient(createSafeServiceClient(chainId, provider))
    } else {
      setSafeApiClient(null)
    }
  }, [chainId, provider])

  return safeApiClient
}

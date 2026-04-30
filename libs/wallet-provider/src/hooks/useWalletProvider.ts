import { useState, useEffect } from 'react'

import { type EIP1193Provider, type PublicClient } from 'viem'
import { useConnection, usePublicClient } from 'wagmi'

export function useWalletProvider(): EIP1193Provider | PublicClient | undefined {
  const [provider, setProvider] = useState<EIP1193Provider | undefined>()

  const { connector } = useConnection()
  const publicClient = usePublicClient()

  useEffect(() => {
    if (!connector || typeof connector.getProvider !== 'function') return

    const getProvider = async (): Promise<void> => {
      try {
        const provider = await connector.getProvider()
        setProvider(provider as EIP1193Provider)
      } catch (error) {
        console.error(error instanceof Error ? error.message : error)
        setProvider(undefined)
      }
    }
    getProvider()
  }, [connector])

  // Return the wallet provider if connected, otherwise return the public client as fallback
  // This matches the behavior of web3-react which always provided a provider for read operations
  return provider ?? publicClient
}

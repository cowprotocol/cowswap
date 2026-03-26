import { useState, useEffect } from 'react'

import { useConnection, usePublicClient } from 'wagmi'

export function useWalletProvider(): unknown | undefined {
  const [provider, setProvider] = useState<unknown | undefined>()

  const { connector } = useConnection()
  const publicClient = usePublicClient()

  useEffect(() => {
    if (!connector || typeof connector.getProvider !== 'function') return
    const getProvider = async (): Promise<void> => {
      try {
        const provider = await connector.getProvider()
        setProvider(provider)
      } catch (error) {
        console.error(error.message)
        setProvider(undefined)
      }
    }
    getProvider()
  }, [connector])

  // Return the wallet provider if connected, otherwise return the public client as fallback
  // This matches the behavior of web3-react which always provided a provider for read operations
  return provider ?? publicClient
}

import { useState, useEffect } from 'react'

import type { Web3Provider } from '@ethersproject/providers'

import { useConnection } from 'wagmi'

export function useWalletProvider(): Web3Provider | undefined {
  // TODO this will probably be removed eventually
  const [provider, setProvider] = useState<Web3Provider | undefined>()

  const { connector } = useConnection()

  useEffect(() => {
    if (!connector) return
    const getProvider = async (): Promise<void> => {
      try {
        const provider = await connector.getProvider()
        setProvider(provider as Web3Provider)
      } catch (error) {
        console.error(error.message)
        setProvider(undefined)
      }
    }
    getProvider()
  }, [connector])

  return provider
}

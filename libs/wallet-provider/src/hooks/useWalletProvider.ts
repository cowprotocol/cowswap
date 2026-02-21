import { useState, useEffect } from 'react'

import { useConnection } from 'wagmi'

export function useWalletProvider(): unknown | undefined {
  const [provider, setProvider] = useState<unknown | undefined>()

  const { connector } = useConnection()

  useEffect(() => {
    if (!connector) return
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

  return provider
}

import { useEffect, useState } from 'react'

import { EthereumProvider } from '@cowprotocol/widget-lib'

import { useConfig } from 'wagmi'

export function useProvider(): EthereumProvider | null {
  const config = useConfig()
  const [provider, setProvider] = useState<EthereumProvider | null>(null)

  useEffect(() => {
    return config.subscribe(({ connector }) => {
      connector?.getProvider().then((provider) => {
        setProvider(provider)
      })
    })
  }, [config])

  return provider
}

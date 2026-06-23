import { useEffect, useState } from 'react'

import { ProviderMetaInfoPayload, WidgetEthereumProvider } from '@cowprotocol/iframe-transport'

import useSWR, { SWRResponse } from 'swr'
import { type EIP1193Provider } from 'viem'
import { useConnection } from 'wagmi'

function useEip1193Provider(): EIP1193Provider | undefined {
  const [provider, setProvider] = useState<EIP1193Provider | undefined>()
  const { connector } = useConnection()

  useEffect(() => {
    if (!connector || typeof connector.getProvider !== 'function') return
    connector
      .getProvider()
      .then((p) => setProvider(p as EIP1193Provider))
      .catch(() => setProvider(undefined))
  }, [connector])

  return provider
}

export function useWidgetProviderMetaInfo(): SWRResponse<ProviderMetaInfoPayload | null> {
  const provider = useEip1193Provider()

  const isWidgetEthereumProvider = provider instanceof WidgetEthereumProvider

  return useSWR(isWidgetEthereumProvider ? [provider, 'useWidgetProviderMetaInfo'] : null, async ([provider]) => {
    return new Promise((resolve) => provider.onProviderMetaInfo(resolve))
  })
}

import { ProviderMetaInfoPayload, WidgetEthereumProvider } from '@cowprotocol/iframe-transport'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import useSWR, { SWRResponse } from 'swr'

export function useWidgetProviderMetaInfo(): SWRResponse<ProviderMetaInfoPayload | null> {
  const provider = useWalletProvider()

  const isWidgetEthereumProvider = provider instanceof WidgetEthereumProvider

  return useSWR(isWidgetEthereumProvider ? [provider, 'useWidgetProviderMetaInfo'] : null, async ([provider]) => {
    return new Promise((resolve) => provider.onProviderMetaInfo(resolve))
  })
}

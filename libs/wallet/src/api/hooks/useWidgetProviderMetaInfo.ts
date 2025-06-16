import { ProviderMetaInfoPayload, WidgetEthereumProvider } from '@cowprotocol/iframe-transport'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import useSWR, { SWRResponse } from 'swr'

export function useWidgetProviderMetaInfo(): SWRResponse<ProviderMetaInfoPayload | null> {
  const provider = useWalletProvider()

  const rawProvider = provider?.provider as unknown
  const isWidgetEthereumProvider = rawProvider instanceof WidgetEthereumProvider

  return useSWR(isWidgetEthereumProvider ? [rawProvider, 'useWidgetProviderMetaInfo'] : null, async ([rawProvider]) => {
    return new Promise((resolve) => rawProvider.onProviderMetaInfo(resolve))
  })
}

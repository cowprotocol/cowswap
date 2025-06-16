import { useEffect, useState } from 'react'

import { ProviderMetaInfoPayload, WidgetEthereumProvider } from '@cowprotocol/iframe-transport'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

export function useWidgetProviderMetaInfo(): ProviderMetaInfoPayload | null {
  const provider = useWalletProvider()
  const [widgetProviderMetaInfo, setWidgetProviderMetaInfo] = useState<ProviderMetaInfoPayload | null>(null)

  const rawProvider = provider?.provider as unknown

  useEffect(() => {
    const isWidgetEthereumProvider = rawProvider instanceof WidgetEthereumProvider

    if (!isWidgetEthereumProvider) return

    rawProvider.onProviderMetaInfo(setWidgetProviderMetaInfo)
  }, [rawProvider])

  return widgetProviderMetaInfo
}

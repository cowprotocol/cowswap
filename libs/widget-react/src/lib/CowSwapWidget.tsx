import { useEffect, useRef } from 'react'

import { cowSwapWidget, CowSwapWidgetParams, EthereumProvider, UpdateWidgetCallback } from '@cowprotocol/widget-lib'

export interface CowSwapWidgetProps {
  params: CowSwapWidgetParams
  provider?: EthereumProvider
}

export function CowSwapWidget({ params, provider }: CowSwapWidgetProps) {
  const providerRef = useRef<EthereumProvider | null>()
  const iframeContainerRef = useRef<HTMLDivElement>(null)
  const updateWidgetRef = useRef<UpdateWidgetCallback | null>(null)

  useEffect(() => {
    if (!iframeContainerRef.current) return

    // Re-initialize widget when provider is changed
    if (provider && providerRef.current !== provider) {
      updateWidgetRef.current = null
    }

    if (updateWidgetRef.current) {
      updateWidgetRef.current(params)
    } else {
      updateWidgetRef.current = cowSwapWidget(iframeContainerRef.current, params)
    }
  }, [provider, params])

  useEffect(() => {
    providerRef.current = provider
  }, [provider])

  return <div ref={iframeContainerRef}></div>
}

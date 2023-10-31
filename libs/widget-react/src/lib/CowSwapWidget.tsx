import { useEffect, useRef } from 'react'

import {
  cowSwapWidget,
  CowSwapWidgetParams,
  CowSwapWidgetSettings,
  EthereumProvider,
  UpdateWidgetCallback,
} from '@cowprotocol/widget-lib'

export interface CowSwapWidgetProps {
  params: Omit<CowSwapWidgetParams, 'container'>
  settings: CowSwapWidgetSettings
  provider?: EthereumProvider
}

export function CowSwapWidget({ params, settings, provider }: CowSwapWidgetProps) {
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
      updateWidgetRef.current(settings)
    } else {
      updateWidgetRef.current = cowSwapWidget({ ...params, container: iframeContainerRef.current }, settings)
    }
  }, [provider, params, settings])

  useEffect(() => {
    providerRef.current = provider
  }, [provider])

  return <div ref={iframeContainerRef}></div>
}

import { useEffect, useRef } from 'react'

import {
  createCowSwapWidget,
  CowSwapWidgetParams,
  EthereumProvider,
  CowSwapWidgetHandler,
} from '@cowprotocol/widget-lib'
import type { CowEventListeners } from '@cowprotocol/events'

export interface CowSwapWidgetProps {
  params: CowSwapWidgetParams
  listeners?: CowEventListeners
  provider?: EthereumProvider
}

export function CowSwapWidget({ params, provider, listeners }: CowSwapWidgetProps) {
  const providerRef = useRef<EthereumProvider | null>()
  const listenersRef = useRef<CowEventListeners | undefined>()
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetHandlerRef = useRef<CowSwapWidgetHandler | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    if (widgetHandlerRef.current === null) {
      widgetHandlerRef.current = createCowSwapWidget(containerRef.current, params, listeners)
      listenersRef.current = listeners
    } else {
      widgetHandlerRef.current.updateWidget(params)
    }
  }, [params])

  useEffect(() => {
    if (!widgetHandlerRef.current || providerRef.current === listeners) return

    widgetHandlerRef.current.updateProvider(provider)
  }, [provider])

  useEffect(() => {
    if (!widgetHandlerRef.current || listenersRef.current === listeners) return

    widgetHandlerRef.current.updateListeners(listeners)
  }, [listeners])

  useEffect(() => {
    providerRef.current = provider
  }, [provider])

  return <div ref={containerRef}></div>
}

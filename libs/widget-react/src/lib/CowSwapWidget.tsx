import { useEffect, useRef, useState } from 'react'

import {
  createCowSwapWidget,
  CowSwapWidgetParams,
  EthereumProvider,
  CowSwapWidgetHandler,
} from '@cowprotocol/widget-lib'
import type { CowEventListeners } from '@cowprotocol/events'

export interface CowSwapWidgetProps {
  params: Omit<CowSwapWidgetParams, 'provider'>
  provider?: EthereumProvider
  listeners?: CowEventListeners
}

export function CowSwapWidget({ params, provider, listeners }: CowSwapWidgetProps) {
  const paramsRef = useRef<Omit<CowSwapWidgetParams, 'provider'> | null>(null)
  const providerRef = useRef<EthereumProvider | null>(provider ?? null)
  const listenersRef = useRef<CowEventListeners | undefined>(listeners)

  const containerRef = useRef<HTMLDivElement>(null)
  const widgetHandlerRef = useRef<CowSwapWidgetHandler | null>(null)

  useEffect(() => {
    if (
      !containerRef.current ||
      paramsRef.current === params ||
      JSON.stringify(paramsRef.current) === JSON.stringify(params)
    )
      return

    paramsRef.current = params

    if (widgetHandlerRef.current === null) {
      console.log('[WIDGET] Creating new widget', {
        state: params,
        listeners,
        provider,
      })
      widgetHandlerRef.current = createCowSwapWidget(
        containerRef.current,
        { ...params, provider: providerRef.current ?? undefined }, // Override params to add the provider
        listeners
      )
      listenersRef.current = listeners
    } else {
      console.log('[WIDGET] Updating params', params)
      widgetHandlerRef.current.updateWidget(params)
    }
  }, [params])

  useEffect(() => {
    if (
      !widgetHandlerRef.current ||
      providerRef.current === provider ||
      (provider === undefined && providerRef.current === null)
    )
      return

    console.log('[WIDGET] Update provider', providerRef.current, provider)
    widgetHandlerRef.current.updateProvider(provider)
  }, [provider])

  useEffect(() => {
    if (!widgetHandlerRef.current || listenersRef.current === listeners) return

    console.log('[WIDGET] Update listeners', listenersRef.current, listeners)
    widgetHandlerRef.current.updateListeners(listeners)
  }, [listeners])

  return <div ref={containerRef}></div>
}

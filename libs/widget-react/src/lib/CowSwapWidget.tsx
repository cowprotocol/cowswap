import { useCallback, useEffect, useRef, useState } from 'react'

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
  const [error, setError] = useState<{ error: Error; message: string } | null>(null)
  const paramsRef = useRef<Omit<CowSwapWidgetParams, 'provider'> | null>(null)
  const providerRef = useRef<EthereumProvider | null>(provider ?? null)
  const listenersRef = useRef<CowEventListeners | undefined>(listeners)

  const containerRef = useRef<HTMLDivElement>(null)
  const widgetHandlerRef = useRef<CowSwapWidgetHandler | null>(null)

  // Error handling
  const tryOrHandleError = useCallback(
    (action: string, actionThatMightFail: () => void) => {
      try {
        console.log(`[WIDGET] ${action}`)
        actionThatMightFail()
      } catch (error) {
        const errorMessage = `Error ${action.toLowerCase()}`
        console.error(`[WIDGET] ${errorMessage}`, error)
        setError({ message: errorMessage, error })
      }
    },
    [setError]
  )

  useEffect(() => {
    if (
      !containerRef.current ||
      paramsRef.current === params ||
      JSON.stringify(paramsRef.current) === JSON.stringify(params)
    ) {
      return
    }

    const container = containerRef.current
    const handler = widgetHandlerRef.current
    paramsRef.current = params

    if (handler === null) {
      tryOrHandleError('Creating a new widget', () => {
        widgetHandlerRef.current = createCowSwapWidget(
          container,
          { ...params, provider: providerRef.current ?? undefined }, // Override params to add the provider
          listeners
        )
        listenersRef.current = listeners
      })
    } else {
      tryOrHandleError('Updating the widget', () => handler.updateWidget(params))
    }
  }, [params])

  useEffect(() => {
    if (
      !widgetHandlerRef.current ||
      providerRef.current === provider ||
      (provider === undefined && providerRef.current === null)
    ) {
      return
    }

    const handler = widgetHandlerRef.current
    tryOrHandleError('Updating the provider', () => handler.updateProvider(provider))
  }, [provider])

  useEffect(() => {
    if (!widgetHandlerRef.current || listenersRef.current === listeners) return

    const handler = widgetHandlerRef.current
    tryOrHandleError('Updating the listeners', () => handler.updateListeners(listeners))
  }, [listeners])

  if (error) {
    return (
      <div style={{ color: '#ff3a3a' }}>
        {error.message}
        {error.error.message && <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75em' }}>{error.error.message}</pre>}
      </div>
    )
  }

  return <div ref={containerRef}></div>
}

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  createCowSwapWidget,
  EthereumProvider,
  CowSwapWidgetHandler,
  CowSwapWidgetProps,
  CowSwapWidgetParams,
} from '@cowprotocol/widget-lib'
import type { CowEventListeners } from '@cowprotocol/events'

import { Command } from '@cowprotocol/types'

export function CowSwapWidget(props: CowSwapWidgetProps) {
  const { params, provider, listeners } = props
  const [error, setError] = useState<{ error: Error; message: string } | null>(null)
  const paramsRef = useRef<CowSwapWidgetParams | null>(null)
  const providerRef = useRef<EthereumProvider | undefined>(provider)
  const listenersRef = useRef<CowEventListeners | undefined>(listeners)
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetHandlerRef = useRef<CowSwapWidgetHandler | null>(null)

  // Error handling
  const tryOrHandleError = useCallback(
    (action: string, actionThatMightFail: Command) => {
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
    if (!containerRef.current || JSON.stringify(paramsRef.current) === JSON.stringify(params)) {
      return
    }

    const container = containerRef.current
    const handler = widgetHandlerRef.current
    paramsRef.current = params

    if (handler === null) {
      tryOrHandleError('Creating a new widget', () => {
        widgetHandlerRef.current = createCowSwapWidget(container, { params, provider: providerRef.current, listeners })
        listenersRef.current = listeners
      })
    } else {
      tryOrHandleError('Updating the widget', () => handler.updateParams(params))
    }
  }, [params])

  useEffect(() => {
    if (!widgetHandlerRef.current || providerRef.current === provider) {
      return
    }

    // Update provider
    providerRef.current = provider

    // TODO: Fix this https://github.com/cowprotocol/cowswap/issues/3810#issue-2127257473 (in meantime forcing full refresh as before)
    // const handler = widgetHandlerRef.current
    // tryOrHandleError('Updating the provider', () => {
    //   handler.updateProvider(provider)
    //   if (paramsRef.current) {
    //     handler.updateWidget(paramsRef.current)
    //   }
    // })
    const container = containerRef.current
    if (container) {
      tryOrHandleError('Updating the provider', () => {
        // Destroy the old widget (if it exists)
        widgetHandlerRef.current?.destroy()

        // Re-create the widget
        widgetHandlerRef.current = createCowSwapWidget(container, { params, provider: providerRef.current, listeners })
      })
    }
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

  return <div ref={containerRef} style={{ width: '100%' }}></div>
}

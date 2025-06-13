import { useCallback, useEffect, useRef, useState } from 'react'

import type { CowWidgetEventListeners } from '@cowprotocol/events'
import type { Command } from '@cowprotocol/types'
import {
  CowSwapWidgetHandler,
  CowSwapWidgetParams,
  CowSwapWidgetProps,
  EthereumProvider,
  createCowSwapWidget,
} from '@cowprotocol/widget-lib'

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function CowSwapWidget(props: CowSwapWidgetProps) {
  const { params, provider, listeners } = props
  const [error, setError] = useState<{ error: Error; message: string } | null>(null)
  const paramsRef = useRef<CowSwapWidgetParams | null>(null)
  const providerRef = useRef<EthereumProvider | undefined>(provider)
  const listenersRef = useRef<CowWidgetEventListeners | undefined>(listeners)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetHandlerRef = useRef<CowSwapWidgetHandler | null>(null)

  // Error handling
  const tryOrHandleError = useCallback((action: string, actionThatMightFail: Command) => {
    try {
      console.log(`[WIDGET] ${action}`)
      actionThatMightFail()
    } catch (error) {
      const errorMessage = `Error ${action.toLowerCase()}`
      console.error(`[WIDGET] ${errorMessage}`, error)
      setError({ message: errorMessage, error })
    }
  }, [])

  // Cleanup widget on mount
  useEffect(() => {
    return () => {
      // Cleanup references
      paramsRef.current = null
      providerRef.current = undefined
      listenersRef.current = undefined

      // Destroy widget
      const handler = widgetHandlerRef.current
      if (handler) {
        tryOrHandleError('💥 Destroy widget', () => handler.destroy())
        widgetHandlerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Create/Update the widget if the parameters change
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
    // Trigger only on params changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, tryOrHandleError])

  // Update widget provider (if it changes)
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
    // Trigger only on provider changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, tryOrHandleError])

  // Update widget listeners (if they change)
  useEffect(() => {
    if (!widgetHandlerRef.current || listenersRef.current === listeners) return

    const handler = widgetHandlerRef.current
    tryOrHandleError('Updating the listeners', () => handler.updateListeners(listeners))
  }, [listeners, tryOrHandleError])

  // Handle errors
  if (error) {
    return (
      <div style={{ color: '#ff3a3a' }}>
        {error.message}
        {error.error.message && <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75em' }}>{error.error.message}</pre>}
      </div>
    )
  }

  // Render widget container
  return <div ref={containerRef} style={{ width: '100%' }}></div>
}

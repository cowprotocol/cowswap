import { JSX, useCallback, useEffect, useRef, useState } from 'react'

import type { CowWidgetEventListeners } from '@cowprotocol/events'
import type { Command } from '@cowprotocol/types'
import {
  CowSwapWidgetHandler,
  CowSwapWidgetParams,
  CowSwapWidgetProps,
  EthereumProvider,
  createCowSwapWidget,
  WIDGET_CONTAINER_ID,
} from '@cowprotocol/widget-lib'

export interface CowSwapWidgetReactProps extends CowSwapWidgetProps {
  /** Stable ref that holds the widget handler while the widget exists, e.g. to call `closeAllModals()` */
  handlerRef?: { current: CowSwapWidgetHandler | null }
}

interface CreateWidgetParams {
  container: HTMLDivElement
  params: CowSwapWidgetParams
  provider?: EthereumProvider
  listeners?: CowWidgetEventListeners
  onReady?: () => void
  onLoadingError?: () => void
  enableSafeSdkBridge: boolean
}
type MutableRef<T> = { current: T }
type SetWidgetHandler = (handler: CowSwapWidgetHandler | null) => void

type WidgetErrorState = { error: Error; message: string } | null

interface WidgetRefs {
  paramsRef: MutableRef<CowSwapWidgetParams | null>
  providerRef: MutableRef<EthereumProvider | undefined>
  listenersRef: MutableRef<CowWidgetEventListeners | undefined>
  enableSafeSdkBridgeRef: MutableRef<boolean>
  widgetHandlerRef: MutableRef<CowSwapWidgetHandler | null>
}

interface WidgetSettings {
  params: CowSwapWidgetParams
  provider?: EthereumProvider
  enableSafeSdkBridge: boolean
}

// eslint-disable-next-line max-lines-per-function
export function CowSwapWidget({
  params,
  provider,
  listeners,
  onReady,
  onLoadingError,
  enableSafeSdkBridge = true,
  handlerRef,
}: CowSwapWidgetReactProps): JSX.Element {
  const [error, setError] = useState<WidgetErrorState>(null)
  const paramsRef = useRef<CowSwapWidgetParams | null>(null)
  const providerRef = useRef<EthereumProvider | undefined>(provider)
  const listenersRef = useRef<CowWidgetEventListeners | undefined>(listeners)
  const enableSafeSdkBridgeRef = useRef(enableSafeSdkBridge)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetHandlerRef = useRef<CowSwapWidgetHandler | null>(null)
  const handlerRefRef = useRef(handlerRef)
  const onLoadingErrorRef = useRef(onLoadingError)
  const latestSettingsRef = useRef<WidgetSettings>({ params, provider, enableSafeSdkBridge })
  const failedSettingsRef = useRef<WidgetSettings | null>(null)

  useEffect(() => {
    onLoadingErrorRef.current = onLoadingError
  }, [onLoadingError])

  useEffect(() => {
    latestSettingsRef.current = { params, provider, enableSafeSdkBridge }
  })

  const setWidgetHandler = useCallback((handler: CowSwapWidgetHandler | null) => {
    widgetHandlerRef.current = handler

    if (handlerRefRef.current) handlerRefRef.current.current = handler
  }, [])

  useEffect(() => {
    handlerRefRef.current = handlerRef

    if (!handlerRef) return

    handlerRef.current = widgetHandlerRef.current

    return () => {
      handlerRef.current = null
    }
  }, [handlerRef])

  const tryOrHandleError = useCallback(
    (action: string, attemptedSettings: WidgetSettings, actionThatMightFail: Command) => {
      try {
        console.log(`[WIDGET] ${action}`)
        actionThatMightFail()
      } catch (_error) {
        const errorMessage = `Error ${action.toLowerCase()}`
        const error = _error instanceof Error ? _error : new Error('Unknown CowSwapWidget error', { cause: _error })

        console.error(`[WIDGET] ${errorMessage}`, error)
        destroyWidget(widgetHandlerRef.current, setWidgetHandler)
        paramsRef.current = null
        failedSettingsRef.current = attemptedSettings
        setError({ message: errorMessage, error })
        onLoadingErrorRef.current?.()
      }
    },
    [setWidgetHandler],
  )

  useDestroyWidgetOnUnmount({
    refs: { paramsRef, providerRef, listenersRef, enableSafeSdkBridgeRef, widgetHandlerRef },
    setWidgetHandler,
  })

  useEffect(() => {
    const failedSettings = failedSettingsRef.current

    if (
      !failedSettings ||
      (failedSettings.provider === provider &&
        failedSettings.enableSafeSdkBridge === enableSafeSdkBridge &&
        !areParamsDifferent(failedSettings.params, params))
    ) {
      return
    }

    failedSettingsRef.current = null
    setError(null)
  }, [params, provider, enableSafeSdkBridge])

  useEffect(() => {
    const enableSafeSdkBridgeDifferent = enableSafeSdkBridgeRef.current !== enableSafeSdkBridge
    const paramsDifferent = !paramsRef.current || areParamsDifferent(paramsRef.current, params)

    if (!containerRef.current || (!paramsDifferent && !enableSafeSdkBridgeDifferent)) {
      return
    }

    const container = containerRef.current
    const handler = widgetHandlerRef.current
    paramsRef.current = params
    enableSafeSdkBridgeRef.current = enableSafeSdkBridge

    if (handler === null) {
      providerRef.current = provider
      tryOrHandleError('Creating a new widget', { params, provider, enableSafeSdkBridge }, () => {
        setWidgetHandler(
          createWidget({
            container,
            params,
            provider,
            listeners,
            onReady,
            onLoadingError,
            enableSafeSdkBridge,
          }),
        )
        listenersRef.current = listeners
      })
    } else if (enableSafeSdkBridgeDifferent) {
      providerRef.current = provider
      tryOrHandleError('Recreating the widget', { params, provider, enableSafeSdkBridge }, () => {
        setWidgetHandler(null)
        handler.destroy()
        setWidgetHandler(
          createWidget({
            container,
            params,
            provider,
            listeners,
            onReady,
            onLoadingError,
            enableSafeSdkBridge,
          }),
        )
        listenersRef.current = listeners
      })
    } else {
      tryOrHandleError('Updating the widget', { params, provider: providerRef.current, enableSafeSdkBridge }, () =>
        handler.updateParams(params),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, enableSafeSdkBridge, tryOrHandleError, error])

  useEffect(() => {
    if (providerRef.current === provider) return

    providerRef.current = provider

    const handler = widgetHandlerRef.current
    const container = containerRef.current
    if (handler && container) {
      tryOrHandleError('Updating the provider', { params, provider, enableSafeSdkBridge }, () => {
        setWidgetHandler(null)
        handler.destroy()

        setWidgetHandler(
          createWidget({
            container,
            params,
            provider,
            listeners,
            onReady,
            onLoadingError,
            enableSafeSdkBridge,
          }),
        )
        enableSafeSdkBridgeRef.current = enableSafeSdkBridge
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReady, provider, tryOrHandleError])

  useEffect(() => {
    if (!widgetHandlerRef.current || listenersRef.current === listeners) return

    const handler = widgetHandlerRef.current
    tryOrHandleError('Updating the listeners', latestSettingsRef.current, () => handler.updateListeners(listeners))
  }, [listeners, tryOrHandleError])

  if (error) {
    return <WidgetError error={error} />
  }

  return (
    <div
      ref={containerRef}
      id={WIDGET_CONTAINER_ID}
      style={{
        width: '100%',
        flex: '1 0 auto',
      }}
    />
  )
}

function areParamsDifferent(prev: CowSwapWidgetParams, next: CowSwapWidgetParams): boolean {
  return areParamsHooksDifferent(prev, next) || JSON.stringify(prev) !== JSON.stringify(next)
}

function areParamsHooksDifferent(prev: CowSwapWidgetParams, next: CowSwapWidgetParams): boolean {
  const nextHooks = next.hooks ?? {}
  const nextKeys = Object.keys(nextHooks)

  const prevHooks = prev.hooks ?? {}
  const prevKeys = Object.keys(prevHooks)

  return (
    nextKeys.some((_key) => {
      const key = _key as keyof CowSwapWidgetParams['hooks']
      return nextHooks[key] !== prevHooks[key]
    }) ||
    prevKeys.some((_key) => {
      const key = _key as keyof CowSwapWidgetParams['hooks']
      return nextHooks[key] !== prevHooks[key]
    })
  )
}

function createWidget({
  container,
  params,
  provider,
  listeners,
  onReady,
  onLoadingError,
  enableSafeSdkBridge,
}: CreateWidgetParams): CowSwapWidgetHandler {
  return createCowSwapWidget(container, {
    params,
    provider,
    listeners,
    onReady,
    enableSafeSdkBridge,
    onLoadingError,
  })
}

function destroyWidget(handler: CowSwapWidgetHandler | null, setWidgetHandler: SetWidgetHandler): void {
  if (!handler) return

  setWidgetHandler(null)

  try {
    handler.destroy()
  } catch (err: unknown) {
    console.error('[WIDGET] Error destroying the widget', err)
  }
}

function useDestroyWidgetOnUnmount({
  refs,
  setWidgetHandler,
}: {
  refs: WidgetRefs
  setWidgetHandler: SetWidgetHandler
}): void {
  useEffect(() => {
    return () => {
      refs.paramsRef.current = null
      refs.providerRef.current = undefined
      refs.listenersRef.current = undefined
      refs.enableSafeSdkBridgeRef.current = true

      destroyWidget(refs.widgetHandlerRef.current, setWidgetHandler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

function WidgetError({ error }: { error: NonNullable<WidgetErrorState> }): JSX.Element {
  return (
    <div style={{ color: '#ff3a3a' }}>
      {error.message}
      {error.error.message && <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75em' }}>{error.error.message}</pre>}
    </div>
  )
}

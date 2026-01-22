import { useCallback, useEffect, useRef, useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createSession, getSseUrl, SessionTokensPayload } from '../services/balancesWatcherApi'
import { BalancesEventHandlers, createBalancesEventSource } from '../services/balancesWatcherEvents'

const RECONNECT_DELAY_MS = 3000
const MAX_RECONNECT_ATTEMPTS = 5

export interface SseConnectionState {
  isConnected: boolean
  isLoading: boolean
  error: Error | null
}

export interface UseSseConnectionParams {
  account: string | undefined
  chainId: SupportedChainId
  enabled: boolean
  payload: SessionTokensPayload
  handlers: Pick<BalancesEventHandlers, 'onAllBalances' | 'onBalanceUpdate' | 'onError'>
}

const INITIAL_STATE: SseConnectionState = {
  isConnected: false,
  isLoading: false,
  error: null,
}

/**
 * Low-level hook to manage SSE connection lifecycle.
 * Creates session, establishes SSE connection, handles reconnection.
 */
export function useSseConnection(params: UseSseConnectionParams): SseConnectionState {
  const { account, chainId, enabled, payload, handlers } = params
  const { onAllBalances, onBalanceUpdate, onError } = handlers

  const [state, setState] = useState<SseConnectionState>(INITIAL_STATE)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const cleanup = useCallback((): void => {
    eventSourceRef.current?.close()
    eventSourceRef.current = null
    clearTimeout(reconnectTimeoutRef.current)
  }, [])

  useEffect(() => {
    const shouldConnect = enabled && account && payload.tokensListsUrls.length > 0

    if (!shouldConnect) {
      cleanup()
      setState(INITIAL_STATE)
      return cleanup
    }

    let cancelled = false

    const scheduleReconnect = (): void => {
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        const error = new Error('BalancesWatcher: Max reconnect attempts reached')
        setState((prev) => ({ ...prev, error }))
        onError?.(error)
        return
      }

      reconnectAttemptsRef.current++
      const delay = RECONNECT_DELAY_MS * 2 ** (reconnectAttemptsRef.current - 1)
      reconnectTimeoutRef.current = setTimeout(() => void connect(), delay)
    }

    const connect = async (): Promise<void> => {
      if (cancelled) return

      cleanup()
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        await createSession(chainId, account, payload)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Session creation failed')
        setState({ ...INITIAL_STATE, error })
        onError?.(error)
        return
      }

      if (cancelled) return

      const sseUrl = getSseUrl(chainId, account)
      eventSourceRef.current = createBalancesEventSource(sseUrl, {
        onAllBalances,
        onBalanceUpdate,
        onError,
        onOpen: (): void => {
          reconnectAttemptsRef.current = 0
          setState({ isConnected: true, isLoading: false, error: null })
        },
        onClose: (): void => {
          setState((prev) => ({ ...prev, isConnected: false }))
          scheduleReconnect()
        },
      })
    }

    void connect()

    return (): void => {
      cancelled = true
      cleanup()
    }
  }, [account, chainId, enabled, payload, cleanup, onAllBalances, onBalanceUpdate, onError])

  return state
}

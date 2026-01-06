import { useCallback, useEffect, useRef, useState } from 'react'

import { BALANCES_SSE_URL } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

const RECONNECT_DELAY_MS = 3000
const MAX_RECONNECT_ATTEMPTS = 5

export interface SseBalancesState {
  isConnected: boolean
  isLoading: boolean
  error: Error | null
}

export interface UseSseBalancesParams {
  account: string | undefined
  chainId: SupportedChainId
  enabled: boolean
  tokensListsUrls: string[]
  customTokens?: string[]
  onAllBalances: (balances: Record<string, string>) => void
  onBalanceUpdate: (address: string, balance: string) => void
  onError?: (error: Error) => void
}

const INITIAL_STATE: SseBalancesState = { isConnected: false, isLoading: false, error: null }

async function createSession(
  chainId: SupportedChainId,
  account: string,
  tokensListsUrls: string[],
  customTokens?: string[],
): Promise<void> {
  const url = `${BALANCES_SSE_URL}/${chainId}/sessions/${account}`
  console.debug('[SSE] Creating session:', url)

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokensListsUrls, customTokens }),
  })

  if (!response.ok) {
    throw new Error(`Session creation failed: ${response.status}`)
  }
  console.debug('[SSE] Session created successfully')
}

interface EventHandlers {
  onAllBalances: (balances: Record<string, string>) => void
  onBalanceUpdate: (address: string, balance: string) => void
  onError?: (error: Error) => void
  onOpen: () => void
  onClose: () => void
}

function setupEventSource(url: string, handlers: EventHandlers): EventSource {
  const { onAllBalances, onBalanceUpdate, onError, onOpen, onClose } = handlers
  console.debug('[SSE] Connecting to:', url)
  const es = new EventSource(url)

  es.onopen = (): void => {
    console.debug('[SSE] Connection opened')
    onOpen()
  }

  es.addEventListener('all_balances', (e: MessageEvent): void => {
    try {
      const { balances } = JSON.parse(e.data)
      if (balances && Object.keys(balances).length > 0) onAllBalances(balances)
    } catch {
      /* ignore */
    }
  })

  es.addEventListener('balance_update', (e: MessageEvent): void => {
    try {
      const { address, balance } = JSON.parse(e.data)
      if (address && balance != null) onBalanceUpdate(address.toLowerCase(), balance)
    } catch {
      /* ignore */
    }
  })

  es.addEventListener('error', (e: MessageEvent): void => {
    try {
      const { message, code } = JSON.parse(e.data)
      onError?.(new Error(`SSE Error ${code}: ${message}`))
    } catch {
      /* ignore */
    }
  })

  es.onerror = (event): void => {
    console.debug('[SSE] Error event, readyState:', es.readyState, event)
    if (es.readyState === EventSource.CLOSED) {
      console.debug('[SSE] Connection closed')
      onClose()
    }
  }

  return es
}

export function useSseBalances(params: UseSseBalancesParams): SseBalancesState {
  const {
    account,
    chainId,
    enabled,
    tokensListsUrls,
    customTokens = [],
    onAllBalances,
    onBalanceUpdate,
    onError,
  } = params

  const [state, setState] = useState<SseBalancesState>(INITIAL_STATE)
  const esRef = useRef<EventSource | null>(null)
  const attemptsRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const cleanup = useCallback((): void => {
    esRef.current?.close()
    esRef.current = null
    clearTimeout(timeoutRef.current)
  }, [])

  useEffect(() => {
    if (!enabled || !account || tokensListsUrls.length === 0) {
      console.debug('[SSE] Skipping connection:', {
        enabled,
        account: !!account,
        tokensListsUrls: tokensListsUrls.length,
      })
      cleanup()
      setState(INITIAL_STATE)
      return cleanup
    }

    let cancelled = false

    const connect = async (): Promise<void> => {
      if (cancelled) return
      cleanup()
      setState((s) => ({ ...s, isLoading: true, error: null }))

      try {
        await createSession(chainId, account, tokensListsUrls, customTokens)
      } catch (e) {
        const error = e instanceof Error ? e : new Error('Session failed')
        console.debug('[SSE] Session creation failed:', error.message)
        setState({ ...INITIAL_STATE, error })
        onError?.(error)
        return
      }

      if (cancelled) return

      esRef.current = setupEventSource(`${BALANCES_SSE_URL}/sse/${chainId}/balances/${account}`, {
        onAllBalances,
        onBalanceUpdate,
        onError,
        onOpen: (): void => {
          attemptsRef.current = 0
          setState({ isConnected: true, isLoading: false, error: null })
        },
        onClose: (): void => {
          setState((s) => ({ ...s, isConnected: false }))
          if (attemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            attemptsRef.current++
            timeoutRef.current = setTimeout(() => void connect(), RECONNECT_DELAY_MS * 2 ** (attemptsRef.current - 1))
          } else {
            const err = new Error('SSE: Max reconnect attempts')
            setState((s) => ({ ...s, error: err }))
            onError?.(err)
          }
        },
      })
    }

    void connect()
    return (): void => {
      cancelled = true
      cleanup()
    }
  }, [account, chainId, enabled, tokensListsUrls, customTokens, cleanup, onAllBalances, onBalanceUpdate, onError])

  return state
}

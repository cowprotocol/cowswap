import { BALANCES_WATCHER_BASE_URL } from '@cowprotocol/common-const'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  type BalanceUpdateEvent,
  type BalancesMap,
  type BalancesWatcherErrorPayload,
  BalancesWatcherStreamError,
} from './types'

const BALANCE_UPDATE_EVENT = 'balance_update'
const ERROR_EVENT = 'error'
const UNPARSEABLE_ERROR_FALLBACK: BalancesWatcherErrorPayload = {
  code: 0,
  message: 'Unparseable error payload from balances watcher',
}

export interface BalancesSubscription {
  close(): void
}

export interface SubscribeToBalancesEventsParams {
  chainId: SupportedChainId
  owner: string
  baseUrl?: string
  /**
   * Called for every `balance_update` SSE event. The first event after connect
   * is the full snapshot (includes zeros for empty balances); every subsequent
   * event contains only the balances that changed. Consumers should merge the
   * payload into their balance map in both cases.
   */
  onBalances: (balances: BalancesMap) => void
  /**
   * Called on any error. `terminal=true` means the subscription has been closed
   * — either because the server sent `event: error` or because the underlying
   * EventSource transitioned to CLOSED. `terminal=false` means EventSource is
   * still attempting to reconnect.
   */
  onError: (error: Error, terminal: boolean) => void
  /**
   * Override EventSource constructor — for tests.
   */
  EventSourceCtor?: typeof EventSource
}

function tryParseJson<T>(input: string): T | undefined {
  try {
    return JSON.parse(input) as T
  } catch {
    return undefined
  }
}

export function subscribeToBalancesEvents(params: SubscribeToBalancesEventsParams): BalancesSubscription {
  const baseUrl = (params.baseUrl ?? BALANCES_WATCHER_BASE_URL).replace(/\/$/, '')
  const url = `${baseUrl}/sse/${params.chainId}/balances/${params.owner}`
  const EventSourceConstructor = params.EventSourceCtor ?? globalThis.EventSource

  if (!EventSourceConstructor) {
    throw new Error('EventSource is not available in this environment')
  }

  let closed = false
  const eventSource = new EventSourceConstructor(url)

  const terminate = (error: Error): void => {
    closed = true
    eventSource.close()
    params.onError(error, true)
  }

  // Any malformed or schema-invalid `balance_update` corrupts the local map
  // (missed snapshot ⇒ no baseline; missed diff ⇒ permanent drift, because the
  // server only emits changed addresses going forward). Close the stream so
  // the caller can re-create the session from a fresh snapshot.
  const handleBalanceUpdate = (event: MessageEvent): void => {
    if (closed) return

    const payload = tryParseJson<BalanceUpdateEvent>(event.data)
    if (!payload) {
      terminate(new Error(`Failed to parse balance_update payload: ${event.data}`))
      return
    }
    if (!payload.balances) {
      terminate(new Error('balance_update payload missing `balances` field'))
      return
    }

    params.onBalances(payload.balances)
  }

  const handleErrorEvent = (event: Event): void => {
    if (closed) return

    // The server emits `event: error` with a JSON envelope when it terminates
    // the stream. EventSource also dispatches its own native 'error' event on
    // transport failure — those events have no `data` field.
    const data = (event as MessageEvent).data
    const isServerError = typeof data === 'string' && data.length > 0

    if (isServerError) {
      const payload = tryParseJson<BalancesWatcherErrorPayload>(data) ?? UNPARSEABLE_ERROR_FALLBACK
      terminate(new BalancesWatcherStreamError(payload))
      return
    }

    // Transport-level failure. EventSource auto-reconnects unless readyState
    // is CLOSED (e.g. server returned non-200 on connect).
    const terminal = eventSource.readyState === eventSource.CLOSED
    if (terminal) {
      closed = true
    }
    params.onError(new Error('Balances watcher SSE transport error'), terminal)
  }

  eventSource.addEventListener(BALANCE_UPDATE_EVENT, handleBalanceUpdate as EventListener)
  eventSource.addEventListener(ERROR_EVENT, handleErrorEvent)

  return {
    close(): void {
      if (closed) return
      closed = true
      eventSource.close()
    },
  }
}

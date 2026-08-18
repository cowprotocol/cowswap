import { BALANCES_AGGREGATOR_BASE_URL } from '@cowprotocol/common-const'
import { isRecord, stripTrailingSlash, tryParseJson } from '@cowprotocol/common-utils'

import {
  type AggregatedBalanceUpdateEvent,
  type AggregatedErrorPayload,
  type BalancesMap,
  BalancesAggregatorStreamError,
} from './types'

import { getBalancesWatcherClientId } from '../balancesWatcher/clientId'

const BALANCE_UPDATE_EVENT = 'balance_update'
const ERROR_EVENT = 'error'
const UNPARSEABLE_ERROR_FALLBACK: AggregatedErrorPayload = {
  code: 0,
  message: 'Unparseable error payload from balances aggregator',
}

export interface AggregatedBalancesSubscription {
  close(): void
}

export interface SubscribeToAggregatedBalancesParams {
  owner: string
  baseUrl?: string
  /**
   * Called for every `balance_update` SSE event, tagged with the chain it came
   * from. The first event per chain is that chain's full snapshot; every
   * subsequent event for the same chain contains only its changed balances.
   */
  onBalances: (chainId: number, balances: BalancesMap) => void
  /**
   * Called on any error. `terminal=true` means the whole merged subscription
   * has been closed (server sent `event: error` with no per-chain scope, or
   * the underlying EventSource transitioned to CLOSED). A `chainId` on the
   * payload means only that chain's upstream feed failed — the merged stream
   * itself is still open.
   */
  onError: (error: Error, terminal: boolean, chainId?: number) => void
  /**
   * Override EventSource constructor — for tests.
   */
  EventSourceConstructor?: typeof EventSource
}

export function subscribeToAggregatedBalances(
  params: SubscribeToAggregatedBalancesParams,
): AggregatedBalancesSubscription {
  const baseUrl = stripTrailingSlash(params.baseUrl ?? BALANCES_AGGREGATOR_BASE_URL)
  // `client_id` goes on the query string because the native `EventSource` API
  // does not support custom request headers.
  const url = new URL(`${baseUrl}/sse/balances/${params.owner}`)
  url.searchParams.set('client_id', getBalancesWatcherClientId())
  const EventSourceConstructor = params.EventSourceConstructor ?? globalThis.EventSource

  if (!EventSourceConstructor) {
    throw new Error('EventSource is not available in this environment')
  }

  let closed = false
  const eventSource = new EventSourceConstructor(url.toString())

  const terminate = (error: Error): void => {
    closed = true
    eventSource.close()
    params.onError(error, true)
  }

  const handleBalanceUpdate = (event: MessageEvent): void => {
    if (closed) return

    const payload = tryParseJson<AggregatedBalanceUpdateEvent>(event.data)
    if (!payload || typeof payload.chainId !== 'number') {
      terminate(new Error(`Failed to parse balance_update payload: ${event.data}`))
      return
    }
    if (!isRecord(payload.balances)) {
      terminate(new Error('balance_update payload missing or invalid `balances` field'))
      return
    }

    params.onBalances(payload.chainId, payload.balances)
  }

  const handleErrorEvent = (event: Event): void => {
    if (closed) return

    const data = (event as MessageEvent).data
    const isServerError = typeof data === 'string' && data.length > 0

    if (isServerError) {
      const payload = tryParseJson<AggregatedErrorPayload>(data) ?? UNPARSEABLE_ERROR_FALLBACK
      if (typeof payload.chainId === 'number') {
        // Scoped to one chain's upstream feed — the merged stream stays open.
        params.onError(new BalancesAggregatorStreamError(payload), false, payload.chainId)
        return
      }
      terminate(new BalancesAggregatorStreamError(payload))
      return
    }

    // Transport-level failure. EventSource auto-reconnects unless readyState
    // is CLOSED (e.g. server returned non-200 on connect).
    const terminal = eventSource.readyState === eventSource.CLOSED
    if (terminal) {
      closed = true
    }
    params.onError(new Error('Balances aggregator SSE transport error'), terminal)
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

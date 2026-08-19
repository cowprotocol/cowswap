import { BalancesMap } from '../balancesWatcher/types'

export interface AggregatedBalanceUpdateEvent {
  balances: BalancesMap
  chainId: number
}

export interface AggregatedErrorPayload {
  code: number
  message: string
  chainId?: number
}

export type { BalancesMap }

export interface ChainSessionResult {
  chainId: number
  status: 'ok' | 'error'
  message?: string
}

export interface CreateAggregatorSessionsRequest {
  networks: Record<string, NetworkTokensRequest>
}

export interface CreateAggregatorSessionsResponse {
  results: ChainSessionResult[]
}

/**
 * Per-chain token selection for one entry of `POST /sessions/{owner}`'s `networks` map.
 * Same shape as the single-chain `CreateSessionRequest`, just keyed by chain id.
 */
export interface NetworkTokensRequest {
  tokenLists: string[]
  customTokens: string[]
}

export class BalancesAggregatorApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message || `Balances aggregator API error (${status})`)
    this.name = 'BalancesAggregatorApiError'
    this.status = status
  }
}

/**
 * Terminal error delivered over the merged SSE channel as `event: error`. The
 * subscription is closed after this fires.
 */
export class BalancesAggregatorStreamError extends Error {
  readonly code: number
  readonly chainId: number | undefined

  constructor(payload: AggregatedErrorPayload) {
    super(payload.message || `Balances aggregator stream error (${payload.code})`)
    this.name = 'BalancesAggregatorStreamError'
    this.code = payload.code
    this.chainId = payload.chainId
  }
}

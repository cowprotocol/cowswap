/**
 * Request body for POST /{chain_id}/sessions/{owner}.
 *
 * The server rejects (400) if both arrays are empty — callers must guard
 * against that before invoking createBalancesWatcherSession.
 */
export interface CreateSessionRequest {
  tokensListsUrls: string[]
  customTokens: string[]
}

/**
 * Map from token address (or the `0xeeee…eeee` native sentinel for the chain's
 * native currency) to balance as a decimal string. Snapshot = full map; diff =
 * only addresses whose balance changed since the previous SSE event.
 */
export type BalancesMap = Record<string, string>

export interface BalanceUpdateEvent {
  balances: BalancesMap
}

export interface BalancesWatcherErrorPayload {
  code: number
  message: string
}

export class BalancesWatcherApiError extends Error {
  readonly status: number
  readonly code: number

  constructor(status: number, payload: BalancesWatcherErrorPayload) {
    super(payload.message || `Balances watcher API error (${status})`)
    this.name = 'BalancesWatcherApiError'
    this.status = status
    this.code = payload.code
  }
}

/**
 * Terminal error delivered over the SSE channel as `event: error`. The
 * subscription is closed after this fires.
 *
 * TODO: add client-side auto-reconnect with backoff (planned for the hardening PR).
 */
export class BalancesWatcherStreamError extends Error {
  readonly code: number

  constructor(payload: BalancesWatcherErrorPayload) {
    super(payload.message || `Balances watcher stream error (${payload.code})`)
    this.name = 'BalancesWatcherStreamError'
    this.code = payload.code
  }
}

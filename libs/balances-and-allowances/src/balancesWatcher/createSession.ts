import { BALANCES_WATCHER_BASE_URL } from '@cowprotocol/common-const'
import { fetchWithTimeout, JSON_HEADERS, parseJsonResponse } from '@cowprotocol/common-utils'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { BalancesWatcherApiError, type BalancesWatcherErrorPayload, type CreateSessionRequest } from './types'

const DEFAULT_SESSION_TIMEOUT_MS = 10_000

export interface CreateSessionParams {
  chainId: SupportedChainId
  owner: string
  body: CreateSessionRequest
  baseUrl?: string
  timeoutMs?: number
}

/**
 * Step 1 of 2 in the balances-watcher handshake: registers the wallet with the
 * watcher and tells it which token lists and individual token addresses to
 * track. Step 2 — opening the SSE balance stream — is done by
 * `subscribeToBalancesEvents` after this call resolves.
 */
export async function createBalancesWatcherSession(params: CreateSessionParams): Promise<void> {
  // Strip a trailing slash so the joined URL doesn't end up with `//`.
  const baseUrl = (params.baseUrl ?? BALANCES_WATCHER_BASE_URL).replace(/\/$/, '')
  const url = `${baseUrl}/${params.chainId}/sessions/${params.owner}`

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(params.body),
    timeout: params.timeoutMs ?? DEFAULT_SESSION_TIMEOUT_MS,
  })

  if (response.ok) return

  const { data, text } = await parseJsonResponse<BalancesWatcherErrorPayload>(response)
  throw new BalancesWatcherApiError(response.status, data ?? { code: response.status, message: text })
}

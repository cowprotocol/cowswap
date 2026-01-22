import { BALANCES_WATCHER_URL } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface SessionTokensPayload {
  tokensListsUrls: string[]
  customTokens?: string[]
}

/**
 * Creates a new session with the balances watcher service.
 * Must be called before establishing an SSE connection.
 *
 * POST /{chain_id}/sessions/{owner}
 */
export async function createSession(
  chainId: SupportedChainId,
  account: string,
  payload: SessionTokensPayload,
): Promise<void> {
  const url = `${BALANCES_WATCHER_URL}/${chainId}/sessions/${account}`

  console.debug('[BalancesWatcher] Creating session:', url)

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Session creation failed: ${response.status}`)
  }

  console.debug('[BalancesWatcher] Session created successfully')
}

/**
 * Updates an existing session to add more tokens dynamically.
 * Can be called while SSE connection is active.
 *
 * PUT /{chain_id}/sessions/{owner}
 */
export async function updateSession(
  chainId: SupportedChainId,
  account: string,
  payload: SessionTokensPayload,
): Promise<void> {
  const url = `${BALANCES_WATCHER_URL}/${chainId}/sessions/${account}`

  console.debug('[BalancesWatcher] Updating session:', url)

  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Session update failed: ${response.status}`)
  }

  console.debug('[BalancesWatcher] Session updated successfully')
}

/**
 * Builds the SSE endpoint URL for balance updates.
 *
 * GET /sse/{chain_id}/balances/{owner}
 */
export function getSseUrl(chainId: SupportedChainId, account: string): string {
  return `${BALANCES_WATCHER_URL}/sse/${chainId}/balances/${account}`
}

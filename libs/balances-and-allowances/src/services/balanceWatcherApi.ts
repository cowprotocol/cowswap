import { BALANCE_WATCHER_URL } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface BwSessionParams {
  tokensListsUrls: string[]
  customTokens: string[]
}

export async function createBwSession(
  chainId: SupportedChainId,
  owner: string,
  params: BwSessionParams,
): Promise<void> {
  const url = `${BALANCE_WATCHER_URL}/${chainId}/sessions/${owner}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new Error(`BW create session failed: ${res.status} ${res.statusText}`)
  }
}

export async function updateBwSession(
  chainId: SupportedChainId,
  owner: string,
  params: BwSessionParams,
): Promise<void> {
  const url = `${BALANCE_WATCHER_URL}/${chainId}/sessions/${owner}`

  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new Error(`BW update session failed: ${res.status} ${res.statusText}`)
  }
}

export function getBwSseUrl(chainId: SupportedChainId, owner: string): string {
  return `${BALANCE_WATCHER_URL}/sse/${chainId}/balances/${owner}`
}

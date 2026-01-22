import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useSseConnection, SseConnectionState } from './useSseConnection'

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

/**
 * Hook to connect to the balances watcher SSE service.
 *
 * Flow:
 * 1. Creates a session via POST /{chain_id}/sessions/{owner}
 * 2. Connects to SSE via GET /sse/{chain_id}/balances/{owner}
 * 3. Handles reconnection with exponential backoff
 */
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

  const payload = useMemo(() => ({ tokensListsUrls, customTokens }), [tokensListsUrls, customTokens])

  const handlers = useMemo(
    () => ({ onAllBalances, onBalanceUpdate, onError }),
    [onAllBalances, onBalanceUpdate, onError],
  )

  const connectionState: SseConnectionState = useSseConnection({
    account,
    chainId,
    enabled,
    payload,
    handlers,
  })

  return connectionState
}

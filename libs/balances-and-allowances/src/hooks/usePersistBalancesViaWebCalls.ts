import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { erc20Abi } from 'viem'
import { useReadContracts } from 'wagmi'

import { useThrottledCallback } from '@cowprotocol/common-hooks'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import { useIsBlockNumberRelevant } from './useIsBlockNumberRelevant'
import { usePersistSplViaMulticall } from './usePersistSplViaMulticall'

import { balancesAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'
import { REPORT_THROTTLE_MS, reportBalancesError } from '../utils/reportBalancesError'

export interface BalancesQueryConfig {
  refetchInterval: number
  isPaused?(): boolean
}

export interface PersistBalancesAndAllowancesParams {
  account: string | undefined
  chainId: SupportedChainId
  tokenAddresses: string[]
  balancesQueryConfig?: BalancesQueryConfig
  setLoadingState?: boolean
  // Increment to force an immediate refetch (e.g. after an order is filled)
  refreshTrigger?: number

  onBalancesLoaded?(loaded: boolean): void

  query?: { refetchInterval?: number | false; refetchOnMount?: boolean }
}

interface MulticallCallResult {
  status: 'success' | 'failure'
  error?: Error
}

// eslint-disable-next-line max-lines-per-function
export function usePersistBalancesViaWebCalls(params: PersistBalancesAndAllowancesParams): void {
  const {
    account,
    chainId,
    tokenAddresses,
    setLoadingState,
    balancesQueryConfig,
    onBalancesLoaded,
    refreshTrigger,
    query: queryOptions,
  } = params

  const setBalances = useSetAtom(balancesAtom)
  const setBalancesUpdate = useSetAtom(balancesUpdateAtom)

  // wagmi + viem only support evm chains
  const isEvm = isEvmChain(chainId)

  // Non-EVM chains (e.g. Solana) load balances and delegations via their own web calls
  usePersistSplViaMulticall(params)

  const {
    data: balances,
    isLoading: isBalancesLoading,
    error,
    dataUpdatedAt,
  } = useReadContracts({
    contracts: tokenAddresses.map((address) => ({
      abi: erc20Abi,
      address: address as `0x${string}`,
      chainId,
      functionName: 'balanceOf',
      args: [account as `0x${string}`],
    })),
    // refetches whenever it changes
    // (is needed when order has been filled or a bridge transfer has completed)
    scopeKey: refreshTrigger !== undefined ? String(refreshTrigger) : undefined,
    query: {
      ...queryOptions,
      refetchInterval: balancesQueryConfig?.refetchInterval ?? queryOptions?.refetchInterval,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: isEvm && !!account && tokenAddresses.length > 0 && !balancesQueryConfig?.isPaused?.(),
    },
  })

  // Query-level error, or the transport failure hidden inside a "successful" result set
  const effectiveError = useMemo(() => error ?? getAllCallsFailedError(balances), [error, balances])

  // Skip results from outdated fetches if there is a result from a newer one
  const isNewData = useIsBlockNumberRelevant(chainId, dataUpdatedAt)

  // Set balances loading state
  useEffect(() => {
    if (!setLoadingState || !isEvm) return

    setBalances((state) => ({ ...state, isLoading: isBalancesLoading, chainId }))
  }, [setBalances, isBalancesLoading, setLoadingState, isEvm, chainId])

  // Report balances multicall failures to Sentry (provider rate-limiting / HTTP 429
  // is tagged distinctly). Runs for every EVM instance, not only full fetches, so
  // rate-limiting is visible regardless of which balances query hit it.
  const reportError = useThrottledCallback(reportBalancesError, REPORT_THROTTLE_MS)

  useEffect(() => {
    if (!isEvm || !effectiveError) return

    reportError({ error: effectiveError, chainId, tokensCount: tokenAddresses.length })
  }, [reportError, effectiveError, isEvm, chainId, tokenAddresses.length])

  // Set balances error state for full balances fetches only
  useEffect(() => {
    if (!setLoadingState || !isEvm) return

    if (!effectiveError) return

    const message = effectiveError instanceof Error ? effectiveError.message : String(effectiveError)

    setBalances((state) => ({ ...state, error: message, isLoading: false }))
  }, [setBalances, effectiveError, setLoadingState, isEvm])

  // Set balances to the store
  useEffect(() => {
    if (!account || !balances?.length || !isNewData) return
    // A fetch where every call failed carries no data — writing it would falsely
    // mark the balances as loaded (`hasFirstLoad: true`, `error: null`).
    if (getAllCallsFailedError(balances)) return

    const balancesState = tokenAddresses.reduce<BalancesState['values']>((acc, address, index) => {
      if (getIsNativeToken(chainId, address)) return acc

      const result = balances[index]?.result
      if (result !== undefined) {
        acc[address.toLowerCase()] = result as bigint
      }
      return acc
    }, {})

    onBalancesLoaded?.(true)

    setBalances((state) => {
      return {
        ...state,
        chainId,
        fromCache: false,
        hasFirstLoad: true,
        error: null,
        values: { ...state.values, ...balancesState },
        ...(setLoadingState ? { isLoading: false } : {}),
      }
    })

    if (setLoadingState) {
      setBalancesUpdate((state) => ({
        ...state,
        [chainId]: {
          ...state[chainId],
          [account.toLowerCase()]: Date.now(),
        },
      }))
    }
  }, [
    chainId,
    account,
    balances,
    isNewData,
    tokenAddresses,
    setBalances,
    setLoadingState,
    onBalancesLoaded,
    setBalancesUpdate,
  ])
}

/**
 * viem's multicall (default `allowFailure: true`) does not reject on transport-level
 * failures (dead RPC node, timeout, 429 on the whole aggregate3 request) — it resolves
 * with per-item `{ status: 'failure' }` results, so the query-level `error` stays null.
 * Every call failing at once is a transport failure, not N broken tokens: surface the
 * underlying error so it gets reported and is not mistaken for a successful load.
 */
function getAllCallsFailedError(calls: readonly MulticallCallResult[] | undefined): Error | undefined {
  if (!calls?.length) return undefined
  if (!calls.every((call) => call.status === 'failure')) return undefined

  return calls[0]?.error
}

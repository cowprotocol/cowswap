import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { erc20Abi } from 'viem'
import { useReadContracts } from 'wagmi'

import { useThrottledCallback } from '@cowprotocol/common-hooks'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import { useIsBlockNumberRelevant } from './useIsBlockNumberRelevant'
import { usePersistSplDataMulticall } from './usePersistSplDataMulticall'

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
  usePersistSplDataMulticall(params)

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
    if (!isEvm || !error) return

    reportError({ error, chainId, tokensCount: tokenAddresses.length })
  }, [reportError, error, isEvm, chainId, tokenAddresses.length])

  // Set balances error state for full balances fetches only
  useEffect(() => {
    if (!setLoadingState || !isEvm) return

    if (!error) return

    const message = error instanceof Error ? error.message : String(error)

    setBalances((state) => ({ ...state, error: message, isLoading: false }))
  }, [setBalances, error, setLoadingState, isEvm])

  // Set balances to the store
  useEffect(() => {
    if (!account || !balances?.length || !isNewData) return

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

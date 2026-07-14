import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { getAddressKey, isSolanaChain } from '@cowprotocol/cow-sdk'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { Connection } from '@solana/web3.js'

import { useIsBlockNumberRelevant } from './useIsBlockNumberRelevant'
import { PersistBalancesAndAllowancesParams } from './usePersistBalancesViaWebCalls'

import { fetchSolanaTokenBalances } from '../services/fetchSolanaTokenBalances'
import { balancesAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'

interface SolanaQueryConfig {
  enabled: boolean
  refetchInterval: number | false | undefined
}

/**
 * Solana counterpart to {@link usePersistBalancesViaWebCalls}. Loads SPL-token balances for
 * `tokenAddresses` via the reown Solana adapter's `Connection` and persists them into `balancesAtom`
 * in the same shape the EVM path uses, so downstream consumers stay chain-agnostic.
 */
export function usePersistSolanaBalancesViaWebCalls(params: PersistBalancesAndAllowancesParams): void {
  const { account, chainId, tokenAddresses, setLoadingState, onBalancesLoaded, refreshTrigger } = params

  const setBalances = useSetAtom(balancesAtom)
  const setBalancesUpdate = useSetAtom(balancesUpdateAtom)

  const { connection } = useAppKitConnection()

  const isSolana = isSolanaChain(chainId)

  // Native SOL is handled elsewhere and has no ATA, so deriving one would throw — keep only SPL mints.
  const tokenMints = useMemo(
    () => tokenAddresses.filter((address) => !getIsNativeToken(chainId, address)),
    [tokenAddresses, chainId],
  )

  const { enabled, refetchInterval } = getSolanaQueryConfig(params, isSolana, connection, tokenMints.length)

  const queryKey = useMemo(
    // `rpcEndpoint` keys the cache to the active network so a chain switch does not surface stale balances.
    // `refreshTrigger` forces an immediate refetch (e.g. after an order is filled), mirroring the EVM `scopeKey`.
    () => ['solanaTokenBalances', chainId, account, connection?.rpcEndpoint, refreshTrigger, tokenMints] as const,
    [chainId, account, connection?.rpcEndpoint, refreshTrigger, tokenMints],
  )

  const {
    data: balances,
    isLoading: isBalancesLoading,
    error,
    dataUpdatedAt,
  } = useQuery({
    queryKey,
    queryFn: () => fetchSolanaTokenBalances(connection!, account!, tokenMints),
    enabled,
    refetchInterval: refetchInterval || undefined,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Skip results from outdated fetches if there is a result from a newer one
  const isNewData = useIsBlockNumberRelevant(chainId, dataUpdatedAt)

  // Set balances loading state
  useEffect(() => {
    if (!setLoadingState || !isSolana) return

    setBalances((state) => ({ ...state, isLoading: isBalancesLoading, chainId }))
  }, [setBalances, isBalancesLoading, setLoadingState, isSolana, chainId])

  // Set balances error state for full balances fetches only
  useEffect(() => {
    if (!setLoadingState || !isSolana) return

    if (!error) return

    const message = error instanceof Error ? error.message : String(error)

    setBalances((state) => ({ ...state, error: message, isLoading: false }))
  }, [setBalances, error, setLoadingState, isSolana])

  // Set balances to the store
  useEffect(() => {
    if (!isSolana || !account || !balances || !isNewData) return

    const balancesState = balances.reduce<BalancesState['values']>((acc, { mint, balance }) => {
      acc[getAddressKey(mint)] = balance
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
    isSolana,
    chainId,
    account,
    balances,
    isNewData,
    setBalances,
    setLoadingState,
    onBalancesLoaded,
    setBalancesUpdate,
  ])
}

function getSolanaQueryConfig(
  params: PersistBalancesAndAllowancesParams,
  isSolana: boolean,
  connection: Connection | undefined,
  tokenMintsCount: number,
): SolanaQueryConfig {
  const { account, balancesQueryConfig, query: queryOptions } = params

  const refetchInterval = balancesQueryConfig?.refetchInterval ?? queryOptions?.refetchInterval
  const enabled = isSolana && !!account && !!connection && tokenMintsCount > 0 && !balancesQueryConfig?.isPaused?.()

  return { enabled, refetchInterval }
}

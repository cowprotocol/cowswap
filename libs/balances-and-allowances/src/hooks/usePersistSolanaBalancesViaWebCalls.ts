import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { skipToken, useQuery } from '@tanstack/react-query'

import { getIsToken2022 } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { getAddressKey, isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useTokensByAddressMapForChain } from '@cowprotocol/tokens'
import { PersistentStateByChain } from '@cowprotocol/types'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { Connection } from '@solana/web3.js'

import { useIsBlockNumberRelevant } from './useIsBlockNumberRelevant'
import { PersistBalancesAndAllowancesParams } from './usePersistBalancesViaWebCalls'

import { findSolanaSettlementStatePda } from '../const/solanaSettlement'
import { fetchSolanaTokenAccounts, SolanaTokenAccountData, SolanaTokenMint } from '../services/fetchSolanaTokenAccounts'
import { allowancesAtom } from '../state/allowancesAtom'
import { balancesAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'

type AllowancesByChain = PersistentStateByChain<Record<string, bigint | undefined>>

interface SolanaQueryConfig {
  enabled: boolean
  refetchInterval: number | false | undefined
}

// The delegate authority is a deterministic PDA — derive it once.
const SOLANA_DELEGATE_AUTHORITY = findSolanaSettlementStatePda()

/**
 * Solana counterpart to {@link usePersistBalancesViaWebCalls}. A single batched read loads both the SPL
 * balance and the SPL delegation (the analogue of an EVM allowance) for `tokenAddresses` via the reown
 * Solana adapter's `Connection` — the delegate rides along with the balance for free. Balances are
 * persisted into `balancesAtom` and delegations into `allowancesAtom` in the same shapes the EVM path
 * uses, so downstream consumers stay chain-agnostic.
 */
export function usePersistSolanaBalancesViaWebCalls(params: PersistBalancesAndAllowancesParams): void {
  const { account, chainId, tokenAddresses, setLoadingState, onBalancesLoaded, refreshTrigger } = params

  const setBalances = useSetAtom(balancesAtom)
  const setBalancesUpdate = useSetAtom(balancesUpdateAtom)
  const setAllowances = useSetAtom(allowancesAtom)

  const { connection } = useAppKitConnection()

  const isSolana = isSolanaChain(chainId)

  const tokensByAddress = useTokensByAddressMapForChain(chainId)

  const tokenMints = useMemo<SolanaTokenMint[]>(
    () => buildSolanaTokenMints(tokenAddresses, chainId, tokensByAddress),
    [tokenAddresses, chainId, tokensByAddress],
  )

  const { enabled, refetchInterval } = getSolanaQueryConfig(params, isSolana, connection, tokenMints.length)

  const queryKey = useMemo(
    // `rpcEndpoint` keys the cache to the active network so a chain switch does not surface stale data.
    // `refreshTrigger` forces an immediate refetch (e.g. after an order is filled), mirroring the EVM `scopeKey`.
    () => ['solanaTokenAccounts', chainId, account, connection?.rpcEndpoint, refreshTrigger, tokenMints] as const,
    [chainId, account, connection?.rpcEndpoint, refreshTrigger, tokenMints],
  )

  const {
    data: accounts,
    isLoading: isBalancesLoading,
    error,
    dataUpdatedAt,
  } = useQuery({
    queryKey,
    queryFn:
      connection && account
        ? () => fetchSolanaTokenAccounts(connection, account, tokenMints, SOLANA_DELEGATE_AUTHORITY)
        : skipToken,
    enabled,
    refetchInterval: refetchInterval || undefined,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: params.query?.refetchOnMount,
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

  // Persist balances and delegations to their stores
  useEffect(() => {
    if (!isSolana || !account || !accounts || !isNewData) return

    onBalancesLoaded?.(true)
    applySolanaBalances(setBalances, chainId, accounts, setLoadingState)
    applySolanaAllowances(setAllowances, chainId, accounts)

    if (setLoadingState) {
      setBalancesUpdate((state) => ({
        ...state,
        [chainId]: { ...state[chainId], [getAddressKey(account)]: Date.now() },
      }))
    }
  }, [
    isSolana,
    chainId,
    account,
    accounts,
    isNewData,
    setBalances,
    setAllowances,
    setLoadingState,
    onBalancesLoaded,
    setBalancesUpdate,
  ])
}

function applySolanaAllowances(
  setAllowances: (update: (prev: AllowancesByChain) => AllowancesByChain) => void,
  chainId: SupportedChainId,
  accounts: SolanaTokenAccountData[],
): void {
  const chainAllowances = accounts.reduce<Record<string, bigint | undefined>>((acc, { mint, delegatedAmount }) => {
    acc[getAddressKey(mint)] = delegatedAmount
    return acc
  }, {})

  setAllowances((state) => ({ ...state, [chainId]: { ...state[chainId], ...chainAllowances } }))
}

function applySolanaBalances(
  setBalances: (update: (prev: BalancesState) => BalancesState) => void,
  chainId: SupportedChainId,
  accounts: SolanaTokenAccountData[],
  setLoadingState?: boolean,
): void {
  const values = accounts.reduce<BalancesState['values']>((acc, { mint, balance }) => {
    acc[getAddressKey(mint)] = balance
    return acc
  }, {})

  setBalances((state) => ({
    ...state,
    chainId,
    fromCache: false,
    hasFirstLoad: true,
    error: null,
    values: { ...state.values, ...values },
    ...(setLoadingState ? { isLoading: false } : {}),
  }))
}

// Native SOL is handled elsewhere and has no ATA, so deriving one would throw — keep only SPL mints.
// The list's `isToken2022` flag picks the token program; mints absent from the list default to classic
// SPL, so a wrong ATA simply reads as a zero balance rather than erroring.
function buildSolanaTokenMints(
  tokenAddresses: string[],
  chainId: PersistBalancesAndAllowancesParams['chainId'],
  tokensByAddress: ReturnType<typeof useTokensByAddressMapForChain>,
): SolanaTokenMint[] {
  return tokenAddresses
    .filter((address) => !getIsNativeToken(chainId, address))
    .map((address) => {
      const isToken2022 = getIsToken2022(tokensByAddress[getAddressKey(address)])

      return {
        mint: address,
        isToken2022,
      }
    })
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

import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { skipToken, useQuery } from '@tanstack/react-query'

import { getIsToken2022 } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { getAddressKey, isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokensByAddress, useTokensByAddressMap, useTokensByAddressMapForChain } from '@cowprotocol/tokens'
import { PersistentStateByChain } from '@cowprotocol/types'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { Connection, PublicKey } from '@solana/web3.js'

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

// The delegate authority is a deterministic PDA. Derived lazily on first fetch (not at module load) and
// cached: deriving eagerly would run Solana crypto the moment the balances barrel imports this module,
// which breaks environments that can't run it (e.g. unit tests).
let solanaDelegateAuthority: PublicKey | undefined

/**
 * Solana counterpart to {@link usePersistBalancesViaWebCalls}. A single batched multi-account read (the
 * Solana analogue of an EVM multicall) loads both the SPL balance and the SPL delegation (the analogue of
 * an EVM allowance) for `tokenAddresses` via the reown Solana adapter's `Connection` — the delegate rides
 * along with the balance for free. Balances are persisted into `balancesAtom` and delegations into
 * `allowancesAtom` in the same shapes the EVM path uses, so downstream consumers stay chain-agnostic.
 */
export function usePersistSplViaMulticall(params: PersistBalancesAndAllowancesParams): void {
  const { account, chainId, tokenAddresses, setLoadingState, onBalancesLoaded, refreshTrigger } = params

  const setBalances = useSetAtom(balancesAtom)
  const setBalancesUpdate = useSetAtom(balancesUpdateAtom)
  const setAllowances = useSetAtom(allowancesAtom)

  const { connection } = useAppKitConnection()

  const isSolana = isSolanaChain(chainId)

  const listTokensByAddress = useTokensByAddressMapForChain(chainId)
  const activeTokensByAddress = useTokensByAddressMap()

  const tokenMints = useMemo<SolanaTokenMint[]>(
    () => buildSolanaTokenMints(tokenAddresses, chainId, listTokensByAddress, activeTokensByAddress),
    [tokenAddresses, chainId, listTokensByAddress, activeTokensByAddress],
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
        ? () => {
            solanaDelegateAuthority ??= findSolanaSettlementStatePda()

            return fetchSolanaTokenAccounts(connection, account, tokenMints, solanaDelegateAuthority)
          }
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
// The `token-2022` tag picks the token program, and the wrong program derives an ATA that does not
// exist, which reads as a zero balance rather than erroring — so a mint whose tag is missing from both
// maps silently loses its balance.
function buildSolanaTokenMints(
  tokenAddresses: string[],
  chainId: PersistBalancesAndAllowancesParams['chainId'],
  listTokensByAddress: TokensByAddress,
  activeTokensByAddress: TokensByAddress,
): SolanaTokenMint[] {
  return tokenAddresses
    .filter((address) => !getIsNativeToken(chainId, address))
    .map((address) => {
      const addressKey = getAddressKey(address)
      // Tokens the user imported are absent from the per-chain list map and known only to the active
      // map, which covers the connected chain alone — hence the chain check before trusting it.
      const activeToken = activeTokensByAddress[addressKey]
      const token = listTokensByAddress[addressKey] ?? (activeToken?.chainId === chainId ? activeToken : undefined)

      return {
        mint: address,
        isToken2022: getIsToken2022(token),
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

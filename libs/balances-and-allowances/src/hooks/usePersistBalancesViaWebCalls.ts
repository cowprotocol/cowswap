import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import { erc20Abi } from 'viem'
import { useReadContracts } from 'wagmi'

import { useIsBlockNumberRelevant } from './useIsBlockNumberRelevant'

import { balancesAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'

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
    query: queryOptions,
  } = params

  const setBalances = useSetAtom(balancesAtom)
  const setBalancesUpdate = useSetAtom(balancesUpdateAtom)

  // wagmi + viem only speak EVM. For non-EVM chains (Solana) we don't have a public client,
  // so `useReadContracts` would dispatch ERC20 calls against a non-EVM RPC and either fail
  // or spam noise. Hard-gate the query here until a Solana balance source is wired up.
  const isEvm = isEvmChain(chainId)

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
    if (!setLoadingState) return

    setBalances((state) => ({ ...state, isLoading: isBalancesLoading, chainId }))
  }, [setBalances, isBalancesLoading, setLoadingState, chainId])

  // Set balances error state for full balances fetches only
  useEffect(() => {
    if (!setLoadingState) return

    if (!error) return

    const message = error instanceof Error ? error.message : String(error)

    setBalances((state) => ({ ...state, error: message, isLoading: false }))
  }, [setBalances, error, setLoadingState])

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

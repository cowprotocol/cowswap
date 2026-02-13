import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { erc20Abi } from 'viem'
import { useReadContracts } from 'wagmi'

import { balancesAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'

export interface PersistBalancesAndAllowancesParams {
  account: string | undefined
  chainId: SupportedChainId
  tokenAddresses: string[]
  setLoadingState?: boolean

  onBalancesLoaded?(loaded: boolean): void
}

export function usePersistBalancesViaWebCalls(params: PersistBalancesAndAllowancesParams): void {
  const { account, chainId, tokenAddresses, setLoadingState, onBalancesLoaded } = params

  const setBalances = useSetAtom(balancesAtom)
  const setBalancesUpdate = useSetAtom(balancesUpdateAtom)

  const {
    data: balances,
    isLoading: isBalancesLoading,
    error,
  } = useReadContracts({
    contracts: tokenAddresses.map((address) => ({
      abi: erc20Abi,
      address,
      chainId,
      functionName: 'balanceOf',
      args: [account],
    })),
  })

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
    if (!account || !balances?.length) return

    const balancesState = tokenAddresses.reduce<BalancesState['values']>((acc, address, index) => {
      if (getIsNativeToken(chainId, address)) return acc

      acc[address.toLowerCase()] = BigInt(balances[index]?.result || 0)
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
  }, [chainId, account, balances, tokenAddresses, setBalances, setLoadingState, onBalancesLoaded, setBalancesUpdate])
}

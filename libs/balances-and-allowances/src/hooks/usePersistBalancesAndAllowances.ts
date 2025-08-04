import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { ERC_20_INTERFACE } from '@cowprotocol/abis'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { MultiCallOptions, useMultipleContractSingleData } from '@cowprotocol/multicall'
import { BigNumber } from '@ethersproject/bignumber'

import { SWRConfiguration } from 'swr'

import { balancesAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'

const MULTICALL_OPTIONS = {}

export interface PersistBalancesAndAllowancesParams {
  account: string | undefined
  chainId: SupportedChainId
  tokenAddresses: string[]
  balancesSwrConfig: SWRConfiguration
  setLoadingState?: boolean
  multicallOptions?: MultiCallOptions
  onBalancesLoaded?(loaded: boolean): void
}

export function usePersistBalancesAndAllowances(params: PersistBalancesAndAllowancesParams): void {
  const {
    account,
    chainId,
    tokenAddresses,
    setLoadingState,
    balancesSwrConfig,
    multicallOptions = MULTICALL_OPTIONS,
    onBalancesLoaded,
  } = params

  const setBalances = useSetAtom(balancesAtom)
  const setBalancesUpdate = useSetAtom(balancesUpdateAtom)

  const balanceOfParams = useMemo(() => (account ? [account] : undefined), [account])

  const { isLoading: isBalancesLoading, data: balances } = useMultipleContractSingleData<{ balance: BigNumber }>(
    tokenAddresses,
    ERC_20_INTERFACE,
    'balanceOf',
    balanceOfParams,
    multicallOptions,
    balancesSwrConfig,
    `${chainId}${account}`,
  )

  // Set balances loading state
  useEffect(() => {
    if (!setLoadingState) return

    setBalances((state) => ({ ...state, isLoading: isBalancesLoading, chainId }))
  }, [setBalances, isBalancesLoading, setLoadingState, chainId])

  // Set balances to the store
  useEffect(() => {
    if (!account || !balances?.length) return

    const balancesState = tokenAddresses.reduce<BalancesState['values']>((acc, address, index) => {
      if (getIsNativeToken(chainId, address)) return acc

      acc[address.toLowerCase()] = balances[index]?.balance
      return acc
    }, {})

    onBalancesLoaded?.(true)

    setBalances((state) => {
      return {
        ...state,
        chainId,
        fromCache: false,
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

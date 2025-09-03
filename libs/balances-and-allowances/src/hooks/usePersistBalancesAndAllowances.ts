import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { ERC_20_INTERFACE } from '@cowprotocol/abis'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { MultiCallOptions, useMultipleContractSingleData } from '@cowprotocol/multicall'
import { BigNumber } from '@ethersproject/bignumber'

import { SWRConfiguration } from 'swr'

import { useBalancesFromBff } from './useBalancesFromBff'
import { useIsBlockNumberRelevant } from './useIsBlockNumberRelevant'

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
  const { account, chainId, tokenAddresses, setLoadingState, onBalancesLoaded } = params

  const setBalances = useSetAtom(balancesAtom)
  const setBalancesUpdate = useSetAtom(balancesUpdateAtom)

  const { isBalancesLoading, balances, blockNumber } = useFetchingBalances(params)

  // Skip multicall results from outdated block if there is a result from newer one
  const isNewBlockNumber = useIsBlockNumberRelevant(chainId, blockNumber)

  // Set balances loading state
  useEffect(() => {
    if (!setLoadingState) return

    setBalances((state) => ({ ...state, isLoading: isBalancesLoading, chainId }))
  }, [setBalances, isBalancesLoading, setLoadingState, chainId])

  // Set balances to the store
  useEffect(() => {
    if (!account || !balances?.length || !isNewBlockNumber) return

    onBalancesLoaded?.(true)

    setBalances((state) => {
      return {
        ...state,
        chainId,
        fromCache: false,
        values: { ...state.values, ...balances },
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
    isNewBlockNumber,
    tokenAddresses,
    setBalances,
    setLoadingState,
    onBalancesLoaded,
    setBalancesUpdate,
  ])
}

function useFetchingBalances(params: PersistBalancesAndAllowancesParams): {
  isBalancesLoading: boolean
  balances: BalancesState['values'] | undefined
  blockNumber: number | undefined
} {
  const { account, chainId, tokenAddresses, balancesSwrConfig, multicallOptions = MULTICALL_OPTIONS } = params

  const balanceOfParams = useMemo(() => (account ? [account] : undefined), [account])

  const { isBffBalanceApiEnabled } = useFeatureFlags()

  const { isLoading: isViewCallBalancesLoading, data } = useMultipleContractSingleData<{ balance: BigNumber }>(
    chainId,
    tokenAddresses,
    ERC_20_INTERFACE,
    'balanceOf',
    balanceOfParams,
    multicallOptions,
    balancesSwrConfig,
    account,
    !isBffBalanceApiEnabled,
  )

  const { isLoading: isBffBalancesLoading, data: bffData } = useBalancesFromBff(
    account,
    chainId,
    balancesSwrConfig,
    isBffBalanceApiEnabled,
  )

  const balances = data?.results
  const isBalancesLoading = isBffBalancesLoading || isViewCallBalancesLoading

  const parsedBffData = bffData
    ? Object.keys(bffData).reduce(
        (acc, key) => {
          acc[key] = BigNumber.from(bffData[key])
          return acc
        },
        {} as Record<string, BigNumber>,
      )
    : undefined

  const balancesState = balances
    ? tokenAddresses.reduce<BalancesState['values']>((acc, address, index) => {
        if (getIsNativeToken(chainId, address)) return acc

        acc[address.toLowerCase()] = balances[index]?.balance
        return acc
      }, {})
    : parsedBffData

  return {
    isBalancesLoading,
    balances: balancesState,
    blockNumber: data?.blockNumber,
  }
}

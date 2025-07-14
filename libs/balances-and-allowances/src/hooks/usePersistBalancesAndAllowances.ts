import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { ERC_20_INTERFACE } from '@cowprotocol/abis'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { MultiCallOptions, useMultipleContractSingleData } from '@cowprotocol/multicall'
import { BigNumber } from '@ethersproject/bignumber'

import { SWRConfiguration } from 'swr'

import { AllowancesState, allowancesFullState } from '../state/allowancesAtom'
import { balancesAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'

const MULTICALL_OPTIONS = {}

export interface PersistBalancesAndAllowancesParams {
  account: string | undefined
  chainId: SupportedChainId
  tokenAddresses: string[]
  balancesSwrConfig: SWRConfiguration
  allowancesSwrConfig: SWRConfiguration
  setLoadingState?: boolean
  multicallOptions?: MultiCallOptions
  onBalancesLoaded?(loaded: boolean): void
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function usePersistBalancesAndAllowances(params: PersistBalancesAndAllowancesParams): void {
  const {
    account,
    chainId,
    tokenAddresses,
    setLoadingState,
    balancesSwrConfig,
    allowancesSwrConfig,
    multicallOptions = MULTICALL_OPTIONS,
    onBalancesLoaded,
  } = params

  const setBalances = useSetAtom(balancesAtom)
  const setAllowances = useSetAtom(allowancesFullState)
  const setBalancesUpdate = useSetAtom(balancesUpdateAtom)

  const spender = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]

  const balanceOfParams = useMemo(() => (account ? [account] : undefined), [account])
  const allowanceParams = useMemo(() => (account && spender ? [account, spender] : undefined), [account, spender])

  const { isLoading: isBalancesLoading, data: balances } = useMultipleContractSingleData<{ balance: BigNumber }>(
    tokenAddresses,
    ERC_20_INTERFACE,
    'balanceOf',
    balanceOfParams,
    multicallOptions,
    balancesSwrConfig,
    account,
  )

  const { isLoading: isAllowancesLoading, data: allowances } = useMultipleContractSingleData<[BigNumber]>(
    tokenAddresses,
    ERC_20_INTERFACE,
    'allowance',
    allowanceParams,
    multicallOptions,
    allowancesSwrConfig,
    account,
  )

  // Set balances loading state
  useEffect(() => {
    if (!setLoadingState) return

    setBalances((state) => ({ ...state, isLoading: isBalancesLoading, chainId }))
  }, [setBalances, isBalancesLoading, setLoadingState, chainId])

  // Set allowances loading state
  useEffect(() => {
    if (!setLoadingState) return

    setAllowances((state) => ({ ...state, isLoading: isAllowancesLoading, chainId }))
  }, [setAllowances, isAllowancesLoading, setLoadingState, chainId])

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

  // Set allowances to the store
  useEffect(() => {
    if (!allowances || !allowances.length) return

    const allowancesState = tokenAddresses.reduce<AllowancesState['values']>((acc, address, index) => {
      acc[address.toLowerCase()] = allowances[index]?.[0]
      return acc
    }, {})

    setAllowances((state) => {
      return {
        ...state,
        values: { ...state.values, ...allowancesState },
        ...(setLoadingState ? { isLoading: false } : {}),
      }
    })
  }, [allowances, tokenAddresses, setAllowances, setLoadingState])
}

import { useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect, useLayoutEffect, useMemo } from 'react'

import { ERC_20_INTERFACE } from '@cowprotocol/abis'
import { usePrevious } from '@cowprotocol/common-hooks'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { MultiCallOptions, useMultipleContractSingleData } from '@cowprotocol/multicall'
import { BigNumber } from '@ethersproject/bignumber'

import { SWRConfiguration } from 'swr'

import { AllowancesState, allowancesFullState } from '../state/allowancesAtom'
import { balancesAtom, balancesCacheAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'

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

  const prevChainId = usePrevious(chainId)
  const prevAccount = usePrevious(account)
  const setBalances = useSetAtom(balancesAtom)
  const setAllowances = useSetAtom(allowancesFullState)
  const setBalancesCache = useSetAtom(balancesCacheAtom)
  const setBalancesUpdate = useSetAtom(balancesUpdateAtom)

  const resetBalances = useResetAtom(balancesAtom)
  const resetAllowances = useResetAtom(allowancesFullState)

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

    setBalances((state) => ({ ...state, isLoading: isBalancesLoading }))
  }, [setBalances, isBalancesLoading, setLoadingState])

  // Set allowances loading state
  useEffect(() => {
    if (!setLoadingState) return

    setAllowances((state) => ({ ...state, isLoading: isAllowancesLoading }))
  }, [setAllowances, isAllowancesLoading, setLoadingState])

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

  // Reset states when wallet is not connected
  useLayoutEffect(() => {
    if (prevAccount && prevAccount !== account) {
      resetBalances()
      resetAllowances()
      setBalancesCache(mapSupportedNetworks({}))
      onBalancesLoaded?.(false)
    }
  }, [chainId, account, prevAccount, resetAllowances, resetBalances, setBalancesCache, onBalancesLoaded])

  /**
   * Reset balances and allowances when chainId is changed.
   *
   * If we don't reset the values, you might see balances from the previous network after switching,
   * because it takes awhile to load balances for the new chain.
   * p.s. there is BalancesCacheUpdater which fills cached values in.
   */
  useLayoutEffect(() => {
    if (!setLoadingState) return
    if (prevChainId && chainId === prevChainId) return

    resetBalances()
    resetAllowances()
    onBalancesLoaded?.(false)
  }, [chainId, prevChainId, setLoadingState, resetBalances, resetAllowances, onBalancesLoaded])
}

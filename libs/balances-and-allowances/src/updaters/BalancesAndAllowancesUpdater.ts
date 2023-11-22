import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { ERC_20_INTERFACE } from '@cowprotocol/abis'
import { GP_VAULT_RELAYER, NATIVE_CURRENCY_BUY_TOKEN } from '@cowprotocol/common-const'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useMultipleContractSingleData } from '@cowprotocol/multicall'
import { useAllTokens } from '@cowprotocol/tokens'
import type { BigNumber } from '@ethersproject/bignumber'

import ms from 'ms.macro'

import { useNativeTokenBalance } from '../hooks/useNativeTokenBalance'
import { AllowancesState, allowancesState } from '../state/allowancesAtom'
import { balancesAtom, BalancesState } from '../state/balancesAtom'

const MULTICALL_OPTIONS = {}
// A small gap between balances and allowances refresh intervals is needed to avoid high load to the node at the same time
const BALANCES_SWR_CONFIG = { refreshInterval: ms`28s` }
const ALLOWANCES_SWR_CONFIG = { refreshInterval: ms`30s` }

export interface BalancesAndAllowancesUpdaterProps {
  account: string | undefined
  chainId: SupportedChainId
}
export function BalancesAndAllowancesUpdater({ account, chainId }: BalancesAndAllowancesUpdaterProps) {
  const allTokens = useAllTokens()

  const setBalances = useSetAtom(balancesAtom)
  const setAllowances = useSetAtom(allowancesState)
  const { data: nativeTokenBalance } = useNativeTokenBalance()

  const spender = GP_VAULT_RELAYER[chainId]

  const tokenAddresses = useMemo(() => allTokens.map((token) => token.address), [allTokens])
  const balanceOfParams = useMemo(() => (account ? [account] : undefined), [account])
  const allowanceParams = useMemo(() => (account && spender ? [account, spender] : undefined), [account, spender])

  const { isLoading: isBalancesLoading, data: balances } = useMultipleContractSingleData<{ balance: BigNumber }>(
    tokenAddresses,
    ERC_20_INTERFACE,
    'balanceOf',
    balanceOfParams,
    MULTICALL_OPTIONS,
    BALANCES_SWR_CONFIG
  )

  const { isLoading: isAllowancesLoading, data: allowances } = useMultipleContractSingleData<[BigNumber]>(
    tokenAddresses,
    ERC_20_INTERFACE,
    'allowance',
    allowanceParams,
    MULTICALL_OPTIONS,
    ALLOWANCES_SWR_CONFIG
  )

  // Set balances loading state
  useEffect(() => {
    setBalances((state) => ({ ...state, isLoading: isBalancesLoading }))
  }, [setBalances, isBalancesLoading])

  // Set allowances loading state
  useEffect(() => {
    setAllowances((state) => ({ ...state, isLoading: isAllowancesLoading }))
  }, [setAllowances, isAllowancesLoading])

  // Set balances to the store
  useEffect(() => {
    if (!balances || !balances.length) return

    const balancesState = tokenAddresses.reduce<BalancesState['values']>((acc, address, index) => {
      acc[address.toLowerCase()] = balances[index]?.balance
      return acc
    }, {})

    // Add native token balance to the store as well
    const nativeToken = NATIVE_CURRENCY_BUY_TOKEN[chainId]
    const nativeBalanceState = nativeTokenBalance ? { [nativeToken.address.toLowerCase()]: nativeTokenBalance } : {}

    setBalances({ isLoading: false, values: { ...balancesState, ...nativeBalanceState } })
  }, [balances, tokenAddresses, setBalances, nativeTokenBalance, chainId])

  // Set allowances to the store
  useEffect(() => {
    if (!allowances || !allowances.length) return

    const allowancesState = tokenAddresses.reduce<AllowancesState['values']>((acc, address, index) => {
      acc[address.toLowerCase()] = allowances[index]?.[0]
      return acc
    }, {})

    setAllowances({ isLoading: false, values: allowancesState })
  }, [allowances, tokenAddresses, setAllowances])

  return null
}

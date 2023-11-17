import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { GP_VAULT_RELAYER, NATIVE_CURRENCY_BUY_TOKEN } from '@cowprotocol/common-const'
import { useMultipleContractSingleData } from '@cowprotocol/multicall'
import { useAllTokens } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'
import type { BigNumber } from '@ethersproject/bignumber'

import ms from 'ms.macro'

import { erc20Interface } from '../const'
import { useNativeTokenBalance } from '../hooks/useNativeTokenBalance'
import { AllowancesState, allowancesState } from '../state/allowancesAtom'
import { balancesAtom, BalancesState } from '../state/balancesAtom'

const MULTICALL_OPTIONS = {}
const SWR_CONFIG = { refreshInterval: ms`30s` }

export function BalancesAndAllowancesUpdater() {
  const { account, chainId } = useWalletInfo()
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
    erc20Interface,
    'balanceOf',
    balanceOfParams,
    MULTICALL_OPTIONS,
    SWR_CONFIG
  )

  const { isLoading: isAllowancesLoading, data: allowances } = useMultipleContractSingleData<[BigNumber]>(
    tokenAddresses,
    erc20Interface,
    'allowance',
    allowanceParams,
    MULTICALL_OPTIONS,
    SWR_CONFIG
  )

  // Set balances loading state
  useEffect(() => {
    setBalances((state) => ({ ...state, isLoading: isBalancesLoading }))
  }, [setBalances, isBalancesLoading])

  // Set allwoances loading state
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

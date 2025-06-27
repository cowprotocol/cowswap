import { useEffect, useState } from 'react'

import { useNativeTokenBalance } from '@cowprotocol/balances-and-allowances'
import { getCurrencyAddress, getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import useSWR from 'swr'

import { useTokenContract } from 'common/hooks/useContract'

import { useCurrentAccountProxyAddress } from './useCurrentAccountProxyAddress'

const BALANCE_UPDATE_INTERVAL = ms`5s`
const BALANCE_SWR_CFG = { refreshInterval: BALANCE_UPDATE_INTERVAL, revalidateOnFocus: true }

export function useFetchTokenBalance(
  selectedCurrency: Currency | undefined,
  chainId: SupportedChainId,
): { tokenBalance: CurrencyAmount<Currency> | null; isLoading: boolean } {
  const selectedTokenAddress = selectedCurrency ? getCurrencyAddress(selectedCurrency) : undefined

  const { contract: erc20Contract } = useTokenContract(selectedTokenAddress)
  const { proxyAddress } = useCurrentAccountProxyAddress() || {}

  const [tokenBalance, setTokenBalance] = useState<CurrencyAmount<Currency> | null>(null)

  const isNativeToken = !!selectedCurrency && getIsNativeToken(selectedCurrency)

  const { isLoading: isErc20BalanceLoading } = useSWR(
    !isNativeToken && erc20Contract && proxyAddress && selectedCurrency
      ? [erc20Contract, proxyAddress, selectedCurrency, selectedTokenAddress, 'cowShedUseFetchTokenBalance']
      : null,
    async ([erc20Contract, proxyAddress, selectedCurrency]) => {
      const balance = await erc20Contract.balanceOf(proxyAddress)

      setTokenBalance(CurrencyAmount.fromRawAmount(selectedCurrency, balance.toHexString()))
    },
    BALANCE_SWR_CFG,
  )

  const { isLoading: isNativeBalanceLoading, data: nativeTokenBalance } = useNativeTokenBalance(
    isNativeToken ? proxyAddress : undefined,
    chainId,
    BALANCE_SWR_CFG,
  )

  useEffect(() => {
    if (!selectedCurrency || !nativeTokenBalance) return

    setTokenBalance(CurrencyAmount.fromRawAmount(selectedCurrency, nativeTokenBalance.toHexString()))
  }, [selectedCurrency, nativeTokenBalance])

  return { tokenBalance, isLoading: isErc20BalanceLoading || isNativeBalanceLoading }
}

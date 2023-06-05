import { useMemo } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'

import { NATIVE_CURRENCY_BUY_ADDRESS } from 'legacy/constants'

import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useWalletInfo } from 'modules/wallet'

import { getAddress } from 'utils/getAddress'

export function useQuoteParams() {
  const { chainId, account } = useWalletInfo()
  const { state } = useDerivedTradeState()

  const { inputCurrency, inputCurrencyAmount, outputCurrency, outputCurrencyAmount, orderKind } = state || {}
  const currencyAmount = orderKind === OrderKind.SELL ? inputCurrencyAmount : outputCurrencyAmount
  const amount = currencyAmount?.quotient.toString()

  return useMemo(() => {
    if (!inputCurrency || !outputCurrency || !amount) {
      return
    }

    const sellToken = getAddress(inputCurrency)
    const buyToken = outputCurrency.isNative ? NATIVE_CURRENCY_BUY_ADDRESS : getAddress(outputCurrency)
    const fromDecimals = inputCurrency?.decimals
    const toDecimals = outputCurrency?.decimals

    return {
      sellToken,
      buyToken,
      amount,
      chainId,
      receiver: account,
      kind: orderKind,
      toDecimals,
      fromDecimals,
      isEthFlow: false, // EthFlow is not compatible with limit orders
    }
  }, [inputCurrency, outputCurrency, amount, account, chainId, orderKind])
}

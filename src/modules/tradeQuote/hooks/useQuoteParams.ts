import { useMemo } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'

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
    const buyToken = getAddress(outputCurrency)
    const fromDecimals = inputCurrency?.decimals
    const toDecimals = outputCurrency?.decimals

    return {
      sellToken,
      buyToken,
      amount,
      chainId,
      receiver: account,
      kind: OrderKind.SELL,
      toDecimals,
      fromDecimals,
      isEthFlow: false,
    }
  }, [inputCurrency, outputCurrency, amount, account, chainId])
}

import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'

import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { TradeType, useTradeTypeInfo } from 'modules/trade/hooks/useTradeTypeInfo'
import { partsStateAtom } from 'modules/twap/state/partsStateAtom'
import { useWalletInfo } from 'modules/wallet'

import { getAddress } from 'utils/getAddress'

export function useQuoteParams() {
  const tradeTypeInfo = useTradeTypeInfo()

  const { chainId, account } = useWalletInfo()
  const { state } = useDerivedTradeState()
  const { inputPartAmount } = useAtomValue(partsStateAtom)

  const { inputCurrency, inputCurrencyAmount, outputCurrency, outputCurrencyAmount, orderKind } = state || {}

  const currencyAmount = useMemo(() => {
    // For TWAP orders, we want to get quote only for single part amount
    if (tradeTypeInfo?.tradeType === TradeType.ADVANCED_ORDERS) {
      return inputPartAmount
    }

    return orderKind === OrderKind.SELL ? inputCurrencyAmount : outputCurrencyAmount
  }, [inputCurrencyAmount, inputPartAmount, orderKind, outputCurrencyAmount, tradeTypeInfo])

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

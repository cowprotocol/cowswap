import { Atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { tryParseFractionalAmount } from '@cowprotocol/common-utils'
import { useTokenBySymbolOrAddress } from '@cowprotocol/tokens'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useCurrencyAmountBalanceCombined } from 'modules/combinedBalances'
import { ExtendedTradeRawState } from 'modules/trade/types/TradeRawState'
import { useTradeUsdAmounts } from 'modules/usdAmount'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { TradeDerivedState } from '../types'

export function useBuildTradeDerivedState(
  stateAtom: Atom<ExtendedTradeRawState>,
  isQuoteBasedOrder: boolean,
): Omit<TradeDerivedState, 'slippage' | 'tradeType'> {
  const rawState = useAtomValue(stateAtom)

  const recipient = rawState.recipient
  const recipientAddress = rawState.recipientAddress
  const orderKind = rawState.orderKind

  const inputCurrency = useTokenBySymbolOrAddress(rawState.inputCurrencyId)
  const outputCurrency = useTokenBySymbolOrAddress(rawState.outputCurrencyId)
  const inputCurrencyAmount = useMemo(
    () => getCurrencyAmount(inputCurrency, rawState.inputCurrencyAmount),
    [inputCurrency, rawState.inputCurrencyAmount],
  )
  const outputCurrencyAmount = useMemo(
    () => getCurrencyAmount(outputCurrency, rawState.outputCurrencyAmount),
    [outputCurrency, rawState.outputCurrencyAmount],
  )
  const inputCurrencyBalance = useCurrencyAmountBalanceCombined(inputCurrency) || null
  const outputCurrencyBalance = useCurrencyAmountBalanceCombined(outputCurrency) || null

  const {
    inputAmount: { value: inputCurrencyFiatAmount },
    outputAmount: { value: outputCurrencyFiatAmount },
  } = useTradeUsdAmounts(inputCurrencyAmount, outputCurrencyAmount, inputCurrency, outputCurrency, true)

  return useSafeMemoObject({
    orderKind,
    recipient,
    recipientAddress,
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    inputCurrencyBalance,
    outputCurrencyBalance,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
    isQuoteBasedOrder,
  })
}

function getCurrencyAmount(
  currency: Nullish<Currency> | null,
  currencyAmount: Nullish<string>,
): CurrencyAmount<Currency> | null {
  if (!currency || !currencyAmount) {
    return null
  }
  // State can be stored as a full string in atoms rather than a json with numerator/denominator
  // Thus we try just that in case the first option fails
  return tryParseFractionalAmount(currency, currencyAmount) || CurrencyAmount.fromRawAmount(currency, currencyAmount)
}

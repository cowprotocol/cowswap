import { Atom, useAtomValue } from 'jotai'

import { useCurrencyAmountBalance } from '@cowprotocol/balances-and-allowances'
import { tryParseFractionalAmount } from '@cowprotocol/common-utils'
import { useTokenBySymbolOrAddress } from '@cowprotocol/tokens'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ExtendedTradeRawState } from 'modules/trade/types/TradeRawState'
import { useTradeUsdAmounts } from 'modules/usdAmount'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

export function useBuildTradeDerivedState(stateAtom: Atom<ExtendedTradeRawState>) {
  const rawState = useAtomValue(stateAtom)

  const recipient = rawState.recipient
  const recipientAddress = rawState.recipientAddress
  const orderKind = rawState.orderKind

  const inputCurrency = useTokenBySymbolOrAddress(rawState.inputCurrencyId)
  const outputCurrency = useTokenBySymbolOrAddress(rawState.outputCurrencyId)
  const inputCurrencyAmount = getCurrencyAmount(inputCurrency, rawState.inputCurrencyAmount)
  const outputCurrencyAmount = getCurrencyAmount(outputCurrency, rawState.outputCurrencyAmount)

  const inputCurrencyBalance = useCurrencyAmountBalance(inputCurrency) || null
  const outputCurrencyBalance = useCurrencyAmountBalance(outputCurrency) || null

  const {
    inputAmount: { value: inputCurrencyFiatAmount },
    outputAmount: { value: outputCurrencyFiatAmount },
  } = useTradeUsdAmounts(inputCurrencyAmount, outputCurrencyAmount, inputCurrency, outputCurrency, true)

  // In limit orders and advanced orders we don't have "real" buy orders
  const slippageAdjustedSellAmount = inputCurrencyAmount
  const slippageAdjustedBuyAmount = outputCurrencyAmount

  return useSafeMemoObject({
    orderKind,
    recipient,
    recipientAddress,
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    slippageAdjustedSellAmount,
    slippageAdjustedBuyAmount,
    inputCurrencyBalance,
    outputCurrencyBalance,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
  })
}

function getCurrencyAmount(
  currency: Nullish<Currency> | null,
  currencyAmount: Nullish<string>
): CurrencyAmount<Currency> | null {
  if (!currency || !currencyAmount) {
    return null
  }
  // State can be stored as a full string in atoms rather than a json with numerator/denominator
  // Thus we try just that in case the first option fails
  return tryParseFractionalAmount(currency, currencyAmount) || CurrencyAmount.fromRawAmount(currency, currencyAmount)
}

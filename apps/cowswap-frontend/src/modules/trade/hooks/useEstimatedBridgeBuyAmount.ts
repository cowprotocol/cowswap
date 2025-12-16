import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useTryFindToken } from '@cowprotocol/tokens'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import { useTradeQuote } from 'modules/tradeQuote'

import { getBridgeIntermediateTokenAddress } from 'common/utils/getBridgeIntermediateTokenAddress'

import { useDerivedTradeState } from './useDerivedTradeState'

export interface BridgeEstimatedAmounts {
  sellAmount: CurrencyAmount<Currency>
  expectedToReceiveAmount: CurrencyAmount<Currency>
  feeAmount: CurrencyAmount<Currency>
  minToReceiveAmount: CurrencyAmount<Currency>
  intermediateCurrency: TokenWithLogo
}

export function useEstimatedBridgeBuyAmount(): BridgeEstimatedAmounts | null {
  const { outputCurrency } = useDerivedTradeState() ?? {}
  const tradeQuote = useTradeQuote()
  const { bridgeQuote } = tradeQuote
  const quoteResults = tradeQuote.quote?.quoteResults

  const intermediateCurrency = useTryFindToken(getBridgeIntermediateTokenAddress(bridgeQuote))?.token ?? undefined

  const swapBuyAmountRaw = quoteResults?.amountsAndCosts.beforeAllFees.buyAmount
  const bridgeSellAmountRaw = bridgeQuote?.amountsAndCosts.beforeFee.sellAmount
  const bridgeBuyAmountRaw = bridgeQuote?.amountsAndCosts.beforeFee.buyAmount
  const feeAmountRaw = bridgeQuote?.amountsAndCosts.costs.bridgingFee.amountInSellCurrency

  return useMemo(() => {
    if (
      !intermediateCurrency ||
      !outputCurrency ||
      !bridgeSellAmountRaw ||
      !bridgeBuyAmountRaw ||
      !swapBuyAmountRaw ||
      typeof feeAmountRaw === 'undefined'
    )
      return null

    const bridgeSellAmount = CurrencyAmount.fromRawAmount(intermediateCurrency, bridgeSellAmountRaw.toString())
    const bridgeBuyAmount = CurrencyAmount.fromRawAmount(outputCurrency, bridgeBuyAmountRaw.toString())
    const swapBuyAmount = CurrencyAmount.fromRawAmount(intermediateCurrency, swapBuyAmountRaw.toString())
    const bridgePrice = new Price({
      baseAmount: bridgeSellAmount,
      quoteAmount: bridgeBuyAmount,
    })

    const expectedToReceiveAmount = bridgePrice.quote(swapBuyAmount)
    const feeAmount = CurrencyAmount.fromRawAmount(expectedToReceiveAmount.currency, feeAmountRaw.toString())
    const minToReceiveAmount = expectedToReceiveAmount.subtract(feeAmount)

    return {
      sellAmount: bridgeSellAmount,
      expectedToReceiveAmount,
      feeAmount,
      minToReceiveAmount,
      intermediateCurrency,
    }
  }, [intermediateCurrency, outputCurrency, bridgeBuyAmountRaw, bridgeSellAmountRaw, swapBuyAmountRaw, feeAmountRaw])
}

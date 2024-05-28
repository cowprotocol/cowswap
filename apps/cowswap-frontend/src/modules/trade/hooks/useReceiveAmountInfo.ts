import { useMemo } from 'react'

import { bpsToPercent, isSellOrder } from '@cowprotocol/common-utils'
import type { OrderParameters } from '@cowprotocol/cow-sdk'
import { PartnerFee } from '@cowprotocol/widget-lib'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import { useWidgetPartnerFee } from 'modules/injectedWidget'
import { useTradeQuote } from 'modules/tradeQuote'

import { useDerivedTradeState } from './useDerivedTradeState'

import { ReceiveAmountInfo } from '../types'

interface ReceiveAmountInfoContext {
  isSell: boolean
  networkFeeAmount: CurrencyAmount<Currency>
  beforeNetworkCosts: {
    sellAmount: CurrencyAmount<Currency>
    buyAmount: CurrencyAmount<Currency>
  }
  afterNetworkCosts: {
    sellAmount: CurrencyAmount<Currency>
    buyAmount: CurrencyAmount<Currency>
  }
  partnerFee: PartnerFee | undefined
}

export function useReceiveAmountInfo(): ReceiveAmountInfo | null {
  const { state } = useDerivedTradeState()
  const { response: quoteResponse } = useTradeQuote()
  const partnerFee = useWidgetPartnerFee()

  return useMemo(() => {
    if (!state) return null

    const { inputCurrency, outputCurrency } = state

    const quote = quoteResponse?.quote

    if (!inputCurrency || !outputCurrency || !quote) return null

    return getReceiveAmountInfo({
      ...getReceiveAmountInfoContext(quote, inputCurrency, outputCurrency),
      partnerFee,
    })
  }, [state, partnerFee, quoteResponse])
}

/**
 * Wraps raw values from the quote API into a context object that can be used to calculate receive amounts
 *
 * @param orderParams - DTO from quote API that contains the fee and amounts information
 * @param inputCurrency - Currency of the input amount
 * @param outputCurrency - Currency of the output amount
 */
export function getReceiveAmountInfoContext(
  orderParams: OrderParameters,
  inputCurrency: Currency,
  outputCurrency: Currency
): Omit<ReceiveAmountInfoContext, 'partnerFee'> {
  /**
   * Wrap raw values into CurrencyAmount objects
   * We also make amounts names more specific with "beforeNetworkCosts" and "afterNetworkCosts"
   */
  const networkFeeAmount = CurrencyAmount.fromRawAmount(inputCurrency, orderParams.feeAmount)
  const sellAmountBeforeNetworkCosts = CurrencyAmount.fromRawAmount(inputCurrency, orderParams.sellAmount)
  const buyAmountAfterNetworkCosts = CurrencyAmount.fromRawAmount(outputCurrency, orderParams.buyAmount)

  const quotePrice = new Price<Currency, Currency>({
    baseAmount: sellAmountBeforeNetworkCosts,
    quoteAmount: buyAmountAfterNetworkCosts,
  })

  const sellAmountAfterNetworkCosts = sellAmountBeforeNetworkCosts.add(networkFeeAmount)
  const buyAmountBeforeNetworkCosts = quotePrice.quote(sellAmountAfterNetworkCosts)

  return {
    isSell: isSellOrder(orderParams.kind),
    networkFeeAmount,
    beforeNetworkCosts: {
      sellAmount: sellAmountBeforeNetworkCosts,
      buyAmount: buyAmountBeforeNetworkCosts,
    },
    afterNetworkCosts: {
      sellAmount: sellAmountAfterNetworkCosts,
      buyAmount: buyAmountAfterNetworkCosts,
    },
  }
}

/**
 * Calculates the receive-amounts information based on the context (which is derived from the quote API response)
 * @param context
 */
export function getReceiveAmountInfo(context: ReceiveAmountInfoContext): ReceiveAmountInfo {
  const { isSell, beforeNetworkCosts, afterNetworkCosts, networkFeeAmount, partnerFee } = context

  const type = isSell ? 'to' : 'from'

  /**
   * Partner fee is always added on the surplus token, for sell-orders it's buy token, for buy-orders it's sell token
   */
  const partnerFeeAmount = partnerFeeBpsToAmount(
    partnerFee?.bps,
    isSell ? beforeNetworkCosts.buyAmount : beforeNetworkCosts.sellAmount
  )

  return {
    type,
    networkFeeAmount,
    partnerFeeAmount,
    ...(isSell
      ? {
          amountBeforeFees: beforeNetworkCosts.buyAmount,
          amountAfterFees: afterNetworkCosts.buyAmount.subtract(partnerFeeAmount),
        }
      : {
          amountBeforeFees: beforeNetworkCosts.sellAmount,
          amountAfterFees: afterNetworkCosts.sellAmount.add(partnerFeeAmount),
        }),
  }
}

function partnerFeeBpsToAmount(bps: number | undefined, amount: CurrencyAmount<Currency>): CurrencyAmount<Currency> {
  return bps ? amount.multiply(bpsToPercent(bps)) : CurrencyAmount.fromRawAmount(amount.currency, 0)
}

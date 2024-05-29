import { useMemo } from 'react'

import { bpsToPercent, isSellOrder } from '@cowprotocol/common-utils'
import type { OrderParameters } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import { useWidgetPartnerFee } from 'modules/injectedWidget'
import { useTradeQuote } from 'modules/tradeQuote'

import { useDerivedTradeState } from './useDerivedTradeState'

import { DirectedReceiveAmounts, ReceiveAmountInfo } from '../types'

export function useReceiveAmountInfo(): ReceiveAmountInfo | null {
  const { state } = useDerivedTradeState()
  const { response: quoteResponse } = useTradeQuote()
  const partnerFee = useWidgetPartnerFee()

  return useMemo(() => {
    if (!state) return null

    const { inputCurrency, outputCurrency } = state

    const quote = quoteResponse?.quote

    if (!inputCurrency || !outputCurrency || !quote) return null

    return getReceiveAmountInfo(quote, inputCurrency, outputCurrency, partnerFee?.bps)
  }, [state, partnerFee, quoteResponse])
}

export function getDirectedReceiveAmounts(info: ReceiveAmountInfo): DirectedReceiveAmounts {
  const {
    isSell,
    costs: { networkFee },
    afterPartnerFees,
    beforeNetworkCosts,
  } = info

  return {
    amountBeforeFees: isSell ? beforeNetworkCosts.buyAmount : beforeNetworkCosts.sellAmount,
    amountAfterFees: isSell ? afterPartnerFees.buyAmount : afterPartnerFees.sellAmount,
    networkFeeAmount: isSell ? networkFee.amountInBuyCurrency : networkFee.amountInSellCurrency,
  }
}

/**
 * Wraps raw values from the quote API into a context object that can be used to calculate receive amounts
 *
 * @param orderParams - DTO from quote API that contains the fee and amounts information
 * @param inputCurrency - Currency of the input amount
 * @param outputCurrency - Currency of the output amount
 * @param _partnerFeeBps - Partner fee in BPS
 */
export function getReceiveAmountInfo(
  orderParams: OrderParameters,
  inputCurrency: Currency,
  outputCurrency: Currency,
  _partnerFeeBps: number | undefined
): ReceiveAmountInfo {
  const partnerFeeBps = _partnerFeeBps ?? 0
  const isSell = isSellOrder(orderParams.kind)
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

  const partnerFeeAmount = partnerFeeBpsToAmount(
    partnerFeeBps,
    isSell ? buyAmountBeforeNetworkCosts : sellAmountBeforeNetworkCosts
  )

  return {
    isSell,
    costs: {
      networkFee: {
        amountInSellCurrency: networkFeeAmount,
        amountInBuyCurrency: quotePrice.quote(networkFeeAmount),
      },
      partnerFee: {
        amount: partnerFeeAmount,
        bps: partnerFeeBps,
      },
    },
    beforeNetworkCosts: {
      sellAmount: sellAmountBeforeNetworkCosts,
      buyAmount: buyAmountBeforeNetworkCosts,
    },
    afterNetworkCosts: {
      sellAmount: sellAmountAfterNetworkCosts,
      buyAmount: buyAmountAfterNetworkCosts,
    },
    /**
     * Partner fee is always added on the surplus token, for sell-orders it's buy token, for buy-orders it's sell token
     */
    afterPartnerFees: isSell
      ? {
          sellAmount: sellAmountBeforeNetworkCosts,
          buyAmount: buyAmountAfterNetworkCosts.subtract(partnerFeeAmount),
        }
      : {
          sellAmount: sellAmountAfterNetworkCosts.add(partnerFeeAmount),
          buyAmount: buyAmountBeforeNetworkCosts,
        },
  }
}

function partnerFeeBpsToAmount(bps: number, amount: CurrencyAmount<Currency>): CurrencyAmount<Currency> {
  return bps > 0 ? amount.multiply(bpsToPercent(bps)) : CurrencyAmount.fromRawAmount(amount.currency, 0)
}

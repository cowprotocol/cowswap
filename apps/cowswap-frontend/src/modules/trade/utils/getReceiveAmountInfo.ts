import { bpsToPercent, isSellOrder } from '@cowprotocol/common-utils'
import type { OrderParameters } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core'

import { DirectedReceiveAmounts, ReceiveAmountInfo } from '../types'

export function getDirectedReceiveAmounts(info: ReceiveAmountInfo): DirectedReceiveAmounts {
  const {
    isSell,
    costs: { networkFee },
    afterPartnerFees,
    afterSlippage,
    beforeNetworkCosts,
  } = info

  return {
    amountBeforeFees: isSell ? beforeNetworkCosts.buyAmount : beforeNetworkCosts.sellAmount,
    amountAfterFees: isSell ? afterPartnerFees.buyAmount : afterPartnerFees.sellAmount,
    amountAfterSlippage: isSell ? afterSlippage.buyAmount : afterSlippage.sellAmount,
    networkFeeAmount: isSell ? networkFee.amountInBuyCurrency : networkFee.amountInSellCurrency,
  }
}

/**
 * Wraps raw values from the quote API into a context object that can be used to calculate receive amounts
 *
 * @param orderParams - DTO from quote API that contains the fee and amounts information
 * @param inputCurrency - Currency of the input amount
 * @param outputCurrency - Currency of the output amount
 * @param slippagePercent
 * @param _partnerFeeBps - Partner fee in BPS
 */
export function getReceiveAmountInfo(
  orderParams: OrderParameters,
  inputCurrency: Currency,
  outputCurrency: Currency,
  slippagePercent: Percent,
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

  /**
   * Partner fee is always added on the surplus token, for sell-orders it's buy token, for buy-orders it's sell token
   */
  const afterPartnerFees = isSell
    ? {
        sellAmount: sellAmountAfterNetworkCosts,
        buyAmount: buyAmountAfterNetworkCosts.subtract(partnerFeeAmount),
      }
    : {
        sellAmount: sellAmountAfterNetworkCosts.add(partnerFeeAmount),
        buyAmount: buyAmountAfterNetworkCosts,
      }

  const afterSlippage = isSell
    ? {
        sellAmount: afterPartnerFees.sellAmount,
        buyAmount: afterPartnerFees.buyAmount.subtract(afterPartnerFees.buyAmount.multiply(slippagePercent)),
      }
    : {
        sellAmount: afterPartnerFees.sellAmount.add(afterPartnerFees.sellAmount.multiply(slippagePercent)),
        buyAmount: afterPartnerFees.buyAmount,
      }

  return {
    isSell,
    quotePrice,
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
    afterPartnerFees,
    afterSlippage,
  }
}

function partnerFeeBpsToAmount(bps: number, amount: CurrencyAmount<Currency>): CurrencyAmount<Currency> {
  return bps > 0 ? amount.multiply(bpsToPercent(bps)) : CurrencyAmount.fromRawAmount(amount.currency, 0)
}

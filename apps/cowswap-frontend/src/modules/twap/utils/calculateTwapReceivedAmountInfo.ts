import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ReceiveAmountInfo } from 'modules/trade'

export function calculateTwapReceivedAmountInfo(
  info: ReceiveAmountInfo | null,
  numOfParts: Nullish<number>,
): typeof info {
  if (!info || !numOfParts) return null

  const {
    isSell,
    quotePrice,
    costs,
    beforeNetworkCosts,
    afterNetworkCosts,
    afterPartnerFees,
    afterSlippage,
    beforeAllFees,
    amountsToSign,
  } = info

  const scaleAmount = (amount: CurrencyAmount<Currency>): CurrencyAmount<Currency> => amount.multiply(numOfParts)

  return {
    isSell,
    quotePrice,
    costs: {
      networkFee: {
        amountInSellCurrency: scaleAmount(costs.networkFee.amountInSellCurrency),
        amountInBuyCurrency: scaleAmount(costs.networkFee.amountInBuyCurrency),
      },
      partnerFee: {
        amount: scaleAmount(costs.partnerFee.amount),
        bps: costs.partnerFee.bps,
      },
      protocolFee: costs.protocolFee
        ? {
            amount: scaleAmount(costs.protocolFee.amount),
            bps: costs.protocolFee.bps,
          }
        : undefined,
    },
    beforeAllFees: {
      sellAmount: scaleAmount(beforeAllFees.sellAmount),
      buyAmount: scaleAmount(beforeAllFees.buyAmount),
    },
    beforeNetworkCosts: {
      sellAmount: scaleAmount(beforeNetworkCosts.sellAmount),
      buyAmount: scaleAmount(beforeNetworkCosts.buyAmount),
    },
    afterNetworkCosts: {
      sellAmount: scaleAmount(afterNetworkCosts.sellAmount),
      buyAmount: scaleAmount(afterNetworkCosts.buyAmount),
    },
    afterPartnerFees: {
      sellAmount: scaleAmount(afterPartnerFees.sellAmount),
      buyAmount: scaleAmount(afterPartnerFees.buyAmount),
    },
    afterSlippage: {
      sellAmount: scaleAmount(afterSlippage.sellAmount),
      buyAmount: scaleAmount(afterSlippage.buyAmount),
    },
    amountsToSign: {
      sellAmount: scaleAmount(amountsToSign.sellAmount),
      buyAmount: scaleAmount(amountsToSign.buyAmount),
    },
  }
}

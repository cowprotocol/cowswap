import type { OrderParameters } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import type { ReceiveAmountInfo } from '../types'

/**
 * Zeros the displayed and signed buy when hook gas consumes the part.
 * The price quote stays the original after-fee buy, because a zero quote amount is not a valid Price.
 * The network fee becomes the whole before-costs output (sell side: the whole part sell).
 */
export function applyConsumedHookGasReceive(info: ReceiveAmountInfo): ReceiveAmountInfo {
  return {
    ...info,
    costs: {
      ...info.costs,
      networkFee: {
        amountInSellCurrency: info.beforeNetworkCosts.sellAmount,
        amountInBuyCurrency: info.beforeNetworkCosts.buyAmount,
      },
    },
    afterNetworkCosts: withZeroBuy(info.afterNetworkCosts),
    afterPartnerFees: withZeroBuy(info.afterPartnerFees),
    afterSlippage: withZeroBuy(info.afterSlippage),
    amountsToSign: withZeroBuy(info.amountsToSign),
  }
}

/** True when adjusted sell or buy is no longer positive and the original quote still is. */
export function hookGasConsumesQuotedPart(
  orderParams: Pick<OrderParameters, 'sellAmount' | 'buyAmount'>,
  quotedOrderParams: Pick<OrderParameters, 'sellAmount' | 'buyAmount'> | undefined,
): boolean {
  if (!quotedOrderParams) return false

  return (
    hasNonPositiveAmount(orderParams) &&
    isPositiveAtom(quotedOrderParams.sellAmount) &&
    isPositiveAtom(quotedOrderParams.buyAmount)
  )
}

function hasNonPositiveAmount(orderParams: Pick<OrderParameters, 'sellAmount' | 'buyAmount'>): boolean {
  return isNonPositiveAtom(orderParams.sellAmount) || isNonPositiveAtom(orderParams.buyAmount)
}

function isIntegerAtom(amount: string): boolean {
  return /^-?\d+$/.test(amount)
}

function isNonPositiveAtom(amount: string): boolean {
  return isIntegerAtom(amount) && BigInt(amount) <= 0n
}

function isPositiveAtom(amount: string): boolean {
  return isIntegerAtom(amount) && BigInt(amount) > 0n
}

function withZeroBuy(amounts: ReceiveAmountInfo['afterNetworkCosts']): ReceiveAmountInfo['afterNetworkCosts'] {
  return {
    sellAmount: amounts.sellAmount,
    buyAmount: CurrencyAmount.fromRawAmount(amounts.buyAmount.currency, 0n),
  }
}

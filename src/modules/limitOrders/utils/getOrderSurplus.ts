// Util functions that only pertain to/deal with operator API related stuff
import BigNumber from 'bignumber.js'
import { ZERO_BIG_NUMBER } from 'constants/index'
import { Order } from 'state/orders/actions'
import { getOrderExecutedAmounts } from './getOrderExecutedAmounts'

type Surplus = {
  amount: BigNumber
  percentage: BigNumber
}

/**
 * Calculates SELL surplus
 *
 * @returns Sell surplus
 */
export function getSellSurplus(order: Order): Surplus {
  const { partiallyFillable } = order

  const surplus = partiallyFillable ? _getPartialFillSellSurplus(order) : _getFillOrKillSellSurplus(order)

  return surplus || ZERO_SURPLUS
}

function _getFillOrKillSellSurplus(order: Order): Surplus | null {
  const { buyAmount, apiAdditionalInfo } = order

  if (!apiAdditionalInfo) {
    return null
  }

  const { executedBuyAmount } = apiAdditionalInfo

  const buyAmountBigNumber = new BigNumber(buyAmount.toString())
  const executedBuyAmountBigNumber = new BigNumber(executedBuyAmount)

  // Difference between what you got minus what you wanted to get is the surplus
  const difference = executedBuyAmountBigNumber.minus(buyAmountBigNumber)

  const amount = difference.gt(ZERO_BIG_NUMBER) ? difference : ZERO_BIG_NUMBER

  const percentage = amount.dividedBy(buyAmountBigNumber)

  return { amount, percentage }
}

function _getPartialFillSellSurplus(order: Order): Surplus | null {
  const { buyAmount, sellAmount, apiAdditionalInfo } = order

  if (!apiAdditionalInfo) {
    return null
  }

  const { executedSellAmountBeforeFees, executedBuyAmount } = apiAdditionalInfo

  const sellAmountBigNumber = new BigNumber(sellAmount)
  const executedSellAmountBigNumber = new BigNumber(executedSellAmountBeforeFees)
  const buyAmountBigNumber = new BigNumber(buyAmount)
  const executedBuyAmountBigNumber = new BigNumber(executedBuyAmount)

  // BUY is QUOTE
  const price = buyAmountBigNumber.dividedBy(sellAmountBigNumber)

  // What you would get at limit price, in sell token atoms
  const minimumBuyAmount = executedSellAmountBigNumber.multipliedBy(price)

  // Surplus is the difference between what you got minus what you would get if executed at limit price
  // Surplus amount, in sell token atoms
  const amount = executedBuyAmountBigNumber.minus(minimumBuyAmount)

  // The percentage is based on the amount you would receive, if executed at limit price
  const percentage = amount.dividedBy(minimumBuyAmount)

  return { amount, percentage }
}

/**
 * Calculates BUY surplus
 *
 * @returns Buy surplus
 */
export function getBuySurplus(order: Order): Surplus {
  const { partiallyFillable } = order

  const surplus = partiallyFillable ? _getPartialFillBuySurplus(order) : _getFillOrKillBuySurplus(order)

  return surplus || ZERO_SURPLUS
}

function _getFillOrKillBuySurplus(order: Order): Surplus | null {
  const { sellAmount, apiAdditionalInfo } = order

  if (!apiAdditionalInfo) {
    return null
  }

  const { executedSellAmountBeforeFees } = apiAdditionalInfo

  const sellAmountBigNumber = new BigNumber(sellAmount)
  const executedSellAmountBigNumber = new BigNumber(executedSellAmountBeforeFees)

  // BUY order has the buy amount fixed, so it'll sell AT MOST `sellAmount`
  // Surplus will come in the form of a "discount", selling less than `sellAmount`
  // The difference between `sellAmount - executedSellAmount` is the surplus.
  const amount = sellAmountBigNumber.minus(executedSellAmountBigNumber)

  const percentage = amount.dividedBy(sellAmountBigNumber)

  return { amount, percentage }
}

function _getPartialFillBuySurplus(order: Order): Surplus | null {
  const { buyAmount, sellAmount, apiAdditionalInfo } = order

  if (!apiAdditionalInfo) {
    return null
  }

  const { executedSellAmountBeforeFees, executedBuyAmount } = apiAdditionalInfo

  const sellAmountBigNumber = new BigNumber(sellAmount)
  const executedSellAmountBigNumber = new BigNumber(executedSellAmountBeforeFees)
  const buyAmountBigNumber = new BigNumber(buyAmount)
  const executedBuyAmountBigNumber = new BigNumber(executedBuyAmount)

  // SELL is QUOTE
  const price = sellAmountBigNumber.dividedBy(buyAmountBigNumber)

  const maximumSellAmount = executedBuyAmountBigNumber.multipliedBy(price)

  const amount = maximumSellAmount.minus(executedSellAmountBigNumber)

  const percentage = amount.dividedBy(maximumSellAmount)

  return { amount, percentage }
}

const ZERO_SURPLUS: Surplus = { amount: ZERO_BIG_NUMBER, percentage: ZERO_BIG_NUMBER }

export function getOrderSurplus(order: Order): Surplus {
  const { kind } = order

  // `executedSellAmount` already has `executedFeeAmount` discounted
  const { executedBuyAmount, executedSellAmount } = getOrderExecutedAmounts(order)

  if (!executedBuyAmount || !executedSellAmount) {
    return ZERO_SURPLUS
  }

  if (kind === 'buy') {
    return getBuySurplus(order)
  } else {
    return getSellSurplus(order)
  }
}

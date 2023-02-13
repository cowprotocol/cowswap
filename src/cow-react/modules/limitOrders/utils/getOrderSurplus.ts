// Util functions that only pertain to/deal with operator API related stuff
import BigNumber from 'bignumber.js'
import { ZERO_BIG_NUMBER } from 'constants/index'
import { Order } from 'state/orders/actions'
import { BigNumberish } from '@ethersproject/bignumber'
import { getOrderExecutedAmounts } from './getOrderExecutedAmounts'

type Surplus = {
  amount: BigNumber
  percentage: BigNumber
}

/**
 * Calculates SELL surplus based on buy amounts
 *
 * @param buyAmount buyAmount
 * @param executedBuyAmount executedBuyAmount
 * @returns Sell surplus
 */
export function getSellSurplus(buyAmount: BigNumberish, executedBuyAmount: BigNumberish): Surplus {
  const buyAmountBigNumber = new BigNumber(buyAmount.toString())
  const executedAmountBigNumber = new BigNumber(executedBuyAmount.toString())
  // SELL order has the sell amount fixed, so it'll buy AT LEAST `buyAmount`
  // Surplus is in the form of additional buy amount
  // The difference between `executedBuyAmount - buyAmount` is the surplus.
  const amount = executedAmountBigNumber.gt(buyAmountBigNumber)
    ? executedAmountBigNumber.minus(buyAmountBigNumber)
    : ZERO_BIG_NUMBER
  const percentage = amount.dividedBy(buyAmountBigNumber)

  return { amount, percentage }
}

/**
 * Calculates BUY surplus based on sell amounts
 *
 * @param sellAmount sellAmount
 * @param executedSellAmountMinusFees executedSellAmount minus executedFeeAmount
 * @returns Buy surplus
 */
export function getBuySurplus(sellAmount: BigNumberish, executedSellAmountMinusFees: BigNumberish): Surplus {
  const sellAmountBigNumber = new BigNumber(sellAmount.toString())
  const executedAmountBigNumber = new BigNumber(executedSellAmountMinusFees.toString())
  // BUY order has the buy amount fixed, so it'll sell AT MOST `sellAmount`
  // Surplus will come in the form of a "discount", selling less than `sellAmount`
  // The difference between `sellAmount - executedSellAmount` is the surplus.
  const amount =
    executedAmountBigNumber.gt(ZERO_BIG_NUMBER) && sellAmountBigNumber.gt(executedAmountBigNumber)
      ? sellAmountBigNumber.minus(executedAmountBigNumber)
      : ZERO_BIG_NUMBER
  const percentage = amount.dividedBy(sellAmountBigNumber)

  return { amount, percentage }
}

export function getOrderSurplus(order: Order): Surplus {
  const { kind, buyAmount, sellAmount, partiallyFillable } = order

  // `executedSellAmount` already has `executedFeeAmount` discounted
  const { executedBuyAmount, executedSellAmount } = getOrderExecutedAmounts(order)

  if (partiallyFillable || !executedBuyAmount || !executedSellAmount) {
    // TODO: calculate how much was matched based on the type and check whether there was any surplus
    return { amount: ZERO_BIG_NUMBER, percentage: ZERO_BIG_NUMBER }
  }

  if (kind === 'buy') {
    return getBuySurplus(sellAmount, executedSellAmount?.toString())
  } else {
    return getSellSurplus(buyAmount, executedBuyAmount?.toString())
  }
}

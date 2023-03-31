import BigNumber from 'bignumber.js'
import JSBI from 'jsbi'

import { useOrders } from 'state/orders/hooks'
import { useCallback, useMemo } from 'react'
import { Order, OrderStatus, PENDING_STATES } from 'state/orders/actions'
import { getOrderFilledAmount } from '@cow/modules/limitOrders/utils/getOrderFilledAmount'
import { getOrderSurplus } from '@cow/modules/limitOrders/utils/getOrderSurplus'
import { getOrderExecutedAmounts } from '@cow/modules/limitOrders/utils/getOrderExecutedAmounts'
import { isOrderFilled } from '@cow/modules/limitOrders/utils/isOrderFilled'
import { ordersSorter } from '@cow/modules/limitOrders/utils/ordersSorter'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'
import { useWalletInfo } from '@cow/modules/wallet'
import { isPartiallyFilled } from '@cow/modules/limitOrders/utils/isPartiallyFilled'

export interface LimitOrdersList {
  pending: ParsedOrder[]
  history: ParsedOrder[]
}

export interface ParsedOrder extends Order {
  executedBuyAmount: JSBI
  executedSellAmount: JSBI
  expirationTime: Date
  fullyFilled: boolean
  partiallyFilled: boolean
  filledAmount: BigNumber
  filledPercentage: BigNumber
  surplusAmount: BigNumber
  surplusPercentage: BigNumber
  executedFeeAmount: string | undefined
  executedSurplusFee: string | null
  formattedPercentage: number
  parsedCreationTime: Date
  executedPrice: Price<Currency, Currency> | null
  activityId: string | undefined
  activityTitle: string
}

const ORDERS_LIMIT = 100

export const parseOrder = (order: Order): ParsedOrder => {
  const { amount: filledAmount, percentage: filledPercentage } = getOrderFilledAmount(order)
  const { amount: surplusAmount, percentage: surplusPercentage } = getOrderSurplus(order)
  const { executedBuyAmount, executedSellAmount } = getOrderExecutedAmounts(order)
  const expirationTime = new Date(Number(order.validTo) * 1000)
  const executedFeeAmount = order.apiAdditionalInfo?.executedFeeAmount
  const executedSurplusFee = order.apiAdditionalInfo?.executedSurplusFee || null
  const parsedCreationTime = new Date(order.creationTime)
  const fullyFilled = isOrderFilled(order)
  const partiallyFilled = isPartiallyFilled(order)
  const formattedPercentage = filledPercentage.times(100).decimalPlaces(2).toNumber()
  const executedPrice = JSBI.greaterThan(executedBuyAmount, JSBI.BigInt(0))
    ? new Price({
        baseAmount: CurrencyAmount.fromRawAmount(order.inputToken, executedSellAmount),
        quoteAmount: CurrencyAmount.fromRawAmount(order.outputToken, executedBuyAmount),
      })
    : null
  const showCreationTxLink =
    (order.status === OrderStatus.CREATING || order.status === OrderStatus.FAILED) &&
    order.orderCreationHash &&
    !order.apiAdditionalInfo
  const activityId = showCreationTxLink ? order.orderCreationHash : order.id
  const activityTitle = showCreationTxLink ? 'Creation transaction' : 'Order ID'

  return {
    ...order,
    expirationTime,
    executedBuyAmount,
    executedSellAmount,
    filledAmount,
    filledPercentage,
    formattedPercentage,
    surplusAmount,
    surplusPercentage,
    executedFeeAmount,
    executedSurplusFee,
    executedPrice,
    parsedCreationTime,
    fullyFilled,
    partiallyFilled,
    activityId,
    activityTitle,
  }
}

export function useLimitOrdersList(): LimitOrdersList {
  const { chainId, account } = useWalletInfo()
  const allNonEmptyOrders = useOrders({ chainId })
  const accountLowerCase = account?.toLowerCase()

  const ordersFilter = useCallback((order: Order) => order.owner.toLowerCase() === accountLowerCase, [accountLowerCase])

  const allSortedOrders = useMemo(() => {
    return allNonEmptyOrders.filter(ordersFilter).map(parseOrder).sort(ordersSorter)
  }, [allNonEmptyOrders, ordersFilter])

  return useMemo(() => {
    const { pending, history } = allSortedOrders.reduce(
      (acc, order) => {
        if (PENDING_STATES.includes(order.status)) {
          acc.pending.push(order)
        } else {
          acc.history.push(order)
        }

        return acc
      },
      { pending: [], history: [] } as LimitOrdersList
    )

    return { pending: pending.slice(0, ORDERS_LIMIT), history: history.slice(0, ORDERS_LIMIT) }
  }, [allSortedOrders])
}

import { TokenAmount } from '@cowprotocol/ui'
import { Currency, Price } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { OrderStatus } from 'legacy/state/orders/actions'

import { calculatePriceDifference } from 'utils/orderUtils/calculatePriceDifference'
import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { getDistanceColor } from '../../containers/OrderRow/utils'

interface TwapScheduledOrderStatusProps {
  childOrders: ParsedOrder[]
  estimatedExecutionPrice: Nullish<Price<Currency, Currency>>
  spotPrice: Nullish<Price<Currency, Currency>>
  isInverted: boolean
  isUnfillable: boolean
}

// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, complexity
export function TwapScheduledOrderStatus({
  childOrders,
  estimatedExecutionPrice,
  spotPrice,
  isInverted,
  isUnfillable,
}: TwapScheduledOrderStatusProps) {
  // If no aggregate state, check for next scheduled order
  const nextScheduledOrder = childOrders.find(
    (childOrder) => childOrder.status === OrderStatus.SCHEDULED && !getIsFinalizedOrder(childOrder),
  )

  if (!nextScheduledOrder) return null

  // For scheduled orders, use the execution price if available, otherwise use the estimated price from props
  const nextOrderExecutionPrice = nextScheduledOrder.executionData.executedPrice || estimatedExecutionPrice
  const nextOrderPriceDiffs = nextOrderExecutionPrice
    ? calculatePriceDifference({
        referencePrice: spotPrice,
        targetPrice: nextOrderExecutionPrice,
        isInverted: false,
      })
    : null

  // Show the execution price for the next scheduled order
  let nextOrderFillsAtContent
  if (nextScheduledOrder.status === OrderStatus.CANCELLED || nextScheduledOrder.isUnfillable) {
    nextOrderFillsAtContent = ''
  } else if (!nextOrderExecutionPrice || nextScheduledOrder.status === OrderStatus.CREATING) {
    nextOrderFillsAtContent = '-'
  } else {
    nextOrderFillsAtContent = (
      <TokenAmount
        amount={isInverted ? nextOrderExecutionPrice.invert() : nextOrderExecutionPrice}
        tokenSymbol={nextOrderExecutionPrice?.quoteCurrency}
        opacitySymbol
      />
    )
  }

  const nextOrderDistance = nextOrderPriceDiffs?.percentage ? `${nextOrderPriceDiffs.percentage.toFixed(2)}%` : '-'

  return (
    <>
      <b>{nextOrderFillsAtContent}</b>
      <i
        style={{
          color:
            !isUnfillable && nextOrderPriceDiffs?.percentage
              ? getDistanceColor(Number(nextOrderPriceDiffs.percentage.toFixed(4)))
              : 'inherit',
        }}
      >
        {nextOrderDistance}
      </i>
    </>
  )
}

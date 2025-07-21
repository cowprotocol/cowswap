import { Loader, TokenAmount } from '@cowprotocol/ui'
import { Currency, Price } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { OrderStatus } from 'legacy/state/orders/actions'

import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export interface OrderMarketPriceProps {
  order: ParsedOrder
  withWarning: boolean
  isTwapTable?: boolean
  isChild?: boolean
  isInverted: boolean
  spotPrice: Nullish<Price<Currency, Currency>>
  childOrders?: ParsedOrder[]
}

// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, complexity
export function OrderMarketPrice({
  withWarning,
  order,
  isTwapTable,
  isChild,
  childOrders,
  spotPrice,
  isInverted,
}: OrderMarketPriceProps) {
  const spotPriceInverted = isInverted ? spotPrice?.invert() : spotPrice

  // Early return for warning states and non-active orders
  if (
    withWarning ||
    order.status === OrderStatus.CREATING ||
    order.status === OrderStatus.PRESIGNATURE_PENDING ||
    getIsFinalizedOrder(order)
  ) {
    return '-'
  }

  // Check children finalization status
  if (isTwapTable && !isChild && childOrders) {
    if (childOrders.every((childOrder) => getIsFinalizedOrder(childOrder))) {
      return '-'
    }
  }

  // Handle spot price cases
  if (spotPrice === null) {
    return '-'
  }

  if (spotPrice) {
    return (
      <TokenAmount
        amount={spotPriceInverted}
        tokenSymbol={spotPriceInverted?.quoteCurrency}
        opacitySymbol
        clickable
        noTitle
      />
    )
  }

  return <Loader size="14px" style={{ margin: '0 0 -2px 7px' }} />
}

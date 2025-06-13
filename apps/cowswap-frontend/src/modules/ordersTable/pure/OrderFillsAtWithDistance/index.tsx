import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { Currency, Price } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { OrderStatus } from 'legacy/state/orders/actions'

import { PENDING_EXECUTION_THRESHOLD_PERCENTAGE } from 'common/constants/common'
import { PriceDifference } from 'utils/orderUtils/calculatePriceDifference'
import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { EstimatedExecutionPrice } from '../../containers/OrderRow/EstimatedExecutionPrice'
import * as styledEl from '../../containers/OrderRow/styled'
import { getDistanceColor } from '../../containers/OrderRow/utils'
import { TwapOrderStatus } from '../TwapOrderStatus'
import { TwapScheduledOrderStatus } from '../TwapScheduledOrderStatus'

export interface OrderFillsAtWithDistanceProps {
  isTwapTable?: boolean
  isChild?: boolean
  childOrders?: ParsedOrder[]
  estimatedPriceWarning: ReactNode | undefined
  estimatedExecutionPrice: Nullish<Price<Currency, Currency>>
  spotPrice: Nullish<Price<Currency, Currency>>
  order: ParsedOrder
  isInverted: boolean
  isUnfillable: boolean
  withWarning: boolean
  warningText: string
  onApprove?: Command
  priceDiffs: PriceDifference
  orderFillsAt: ReactNode
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function OrderFillsAtWithDistance({
  isTwapTable,
  isChild,
  childOrders,
  estimatedPriceWarning,
  estimatedExecutionPrice,
  spotPrice,
  order,
  isInverted,
  isUnfillable,
  withWarning,
  warningText,
  onApprove,
  priceDiffs,
  orderFillsAt,
}: OrderFillsAtWithDistanceProps) {
  // For TWAP parent orders
  if (isTwapTable && !isChild && childOrders) {
    return (
      estimatedPriceWarning || (
        <styledEl.CellElement doubleRow>
          <TwapOrderStatus orderStatus={order.status} childOrders={childOrders}>
            <TwapScheduledOrderStatus
              childOrders={childOrders}
              isInverted={isInverted}
              isUnfillable={isUnfillable}
              estimatedExecutionPrice={estimatedExecutionPrice}
              spotPrice={spotPrice}
            />
          </TwapOrderStatus>
        </styledEl.CellElement>
      )
    )
  }

  // Regular order display logic (including child orders)
  if (withWarning || isUnfillable) {
    return (
      <styledEl.ExecuteCellWrapper>
        <EstimatedExecutionPrice
          amount={undefined}
          tokenSymbol={undefined}
          isInverted={isInverted}
          isUnfillable={true}
          canShowWarning={true}
          warningText={warningText}
          onApprove={onApprove}
        />
      </styledEl.ExecuteCellWrapper>
    )
  }

  // Regular order display logic
  const distance =
    getIsFinalizedOrder(order) ||
    order.status === OrderStatus.CANCELLED ||
    isUnfillable ||
    (priceDiffs?.percentage &&
      Math.abs(Number(priceDiffs.percentage.toFixed(4))) <= PENDING_EXECUTION_THRESHOLD_PERCENTAGE)
      ? ''
      : priceDiffs?.percentage
        ? `${priceDiffs?.percentage.toFixed(2)}%`
        : '-'

  return (
    <styledEl.CellElement doubleRow>
      <b>{orderFillsAt}</b>
      <i
        style={{
          color:
            !isUnfillable && priceDiffs?.percentage
              ? getDistanceColor(Number(priceDiffs.percentage.toFixed(4)))
              : 'inherit',
        }}
      >
        {distance}
      </i>
    </styledEl.CellElement>
  )
}

import type { ReactNode } from 'react'

import { getTwapExecutionStatus, type TwapExecutionStatus, type TwapOrder } from '@cowprotocol/sdk-composable'

import { StatusLabel } from 'components/orders/StatusLabel'

import { OrderStatus } from 'api/operator'

const EXPLORER_STATUS: Record<TwapExecutionStatus, OrderStatus> = {
  open: OrderStatus.Open,
  filled: OrderStatus.Filled,
  partiallyFilled: OrderStatus.PartiallyFilled,
  expired: OrderStatus.Expired,
  cancelled: OrderStatus.Cancelled,
}

interface TwapStatusProps {
  order: TwapOrder
  now: number
}

export function TwapStatus({ order, now }: TwapStatusProps): ReactNode {
  const { schedule, executedAmounts, status } = order
  const executionStatus = getTwapExecutionStatus({
    status,
    executedSellAmount: executedAmounts.executedSellAmount,
    partSellAmount: schedule.partSellAmount,
    numberOfParts: schedule.numberOfParts,
    effectiveStartTime: schedule.effectiveStartTime,
    timeBetweenParts: schedule.timeBetweenParts,
    now,
  })

  return <StatusLabel status={EXPLORER_STATUS[executionStatus]} />
}

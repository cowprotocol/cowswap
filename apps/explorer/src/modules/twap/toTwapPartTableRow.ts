import { OrderKind } from '@cowprotocol/cow-sdk'
import type { TwapOrder, TwapPartOrder, TwapPartOrderStatus } from '@cowprotocol/sdk-composable'

import BigNumber from 'bignumber.js'

import { OrderStatus } from 'api/operator'

import type { TokenErc20 } from '@gnosis.pm/dex-js'
import type { OrderTableRowData } from 'components/orders/OrdersUserDetailsTable'

const STATUSES: Record<TwapPartOrderStatus, OrderTableRowData['status']> = {
  open: OrderStatus.Open,
  fulfilled: OrderStatus.Filled,
  cancelled: OrderStatus.Cancelled,
  expired: OrderStatus.Expired,
  unfilled: OrderStatus.Expired,
  unconfirmed: 'unconfirmed',
}

const LABELS: Partial<Record<TwapPartOrderStatus, string>> = {
  unconfirmed: 'SCHEDULED',
  unfilled: 'UNFILLED',
}

export function toTwapPartTableRow(
  part: TwapPartOrder,
  schedule: Pick<TwapOrder['schedule'], 'durationOfPart' | 'timeBetweenParts'>,
  sellToken?: TokenErc20 | null,
  buyToken?: TokenErc20 | null,
): OrderTableRowData {
  const executionWindow = schedule.durationOfPart || schedule.timeBetweenParts
  const scheduledStart = part.validTo === null ? part.createdAt : part.validTo - executionWindow + 1

  return {
    uid: part.orderUid,
    kind: OrderKind.SELL,
    creationDate: new Date(scheduledStart * 1000),
    sellToken,
    buyToken,
    sellAmount: new BigNumber(part.sellAmount.toString()),
    buyAmount: new BigNumber(part.buyAmount.toString()),
    feeAmount: new BigNumber(part.feeAmount.toString()),
    executedSellAmount: new BigNumber((part.executedSellAmount ?? 0n).toString()),
    executedBuyAmount: new BigNumber((part.executedBuyAmount ?? 0n).toString()),
    partiallyFilled: false,
    filledPercentage: new BigNumber(part.status === 'fulfilled' ? 100 : 0),
    status: STATUSES[part.status],
    statusLabel: LABELS[part.status],
  }
}

import { getExplorerTwapOrderLink, timeSinceInSeconds } from '@cowprotocol/common-utils'
import { UiOrderType } from '@cowprotocol/types'

import { getSurveyType, triggerAppziSurvey } from 'appzi'

import { TwapOrderItem, TwapOrderStatus } from '../types'

export type TwapAppziSurveyEvent = { created: true } | { traded: true } | { expired: true } | { cancelled: true }

export function getPendingTwapSurveyOrderIds(orders: TwapOrderItem[]): string {
  return orders
    .filter(({ status }) => status === TwapOrderStatus.Pending)
    .map(({ id }) => id)
    .join(',')
}

export function triggerTwapAppziSurvey(
  order: TwapOrderItem,
  event: TwapAppziSurveyEvent,
  orders: TwapOrderItem[],
): void {
  triggerAppziSurvey(
    {
      ...event,
      secondsSinceOpen: timeSinceInSeconds(Date.parse(order.executedDate ?? order.submissionDate)),
      explorerUrl: getExplorerTwapOrderLink(order.chainId, order.id),
      chainId: order.chainId,
      orderType: UiOrderType.TWAP,
      account: order.resolvedOwner ?? order.safeAddress,
      pendingOrderIds: getPendingTwapSurveyOrderIds(orders),
    },
    getSurveyType(UiOrderType.TWAP),
  )
}

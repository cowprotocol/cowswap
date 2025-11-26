import { UI } from '@cowprotocol/ui'

import { i18n, MessageDescriptor } from '@lingui/core'
import { msg, t } from '@lingui/core/macro'

import { OrderStatus } from 'legacy/state/orders/actions'

import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

const titleMap: { [key in OrderStatus]: MessageDescriptor } = {
  [OrderStatus.PENDING]: msg`Open`,
  [OrderStatus.PRESIGNATURE_PENDING]: msg`Signing`,
  [OrderStatus.FULFILLED]: msg`Filled`,
  [OrderStatus.EXPIRED]: msg`Expired`,
  [OrderStatus.CANCELLED]: msg`Cancelled`,
  [OrderStatus.CREATING]: msg`Creating`,
  [OrderStatus.FAILED]: msg`Failed`,
  [OrderStatus.SCHEDULED]: msg`Scheduled`,
}

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export function getOrderStatusTitleAndColor(order: ParsedOrder): { title: string; color: string; background: string } {
  // We consider the order fully filled for display purposes even if not 100% filled
  // For this reason we use the flag to override the order status
  if (order.executionData.fullyFilled || order.status === OrderStatus.FULFILLED) {
    return {
      title: i18n._(titleMap[OrderStatus.FULFILLED]),
      color: `var(${UI.COLOR_SUCCESS_TEXT})`,
      background: `var(${UI.COLOR_SUCCESS_BG})`,
    }
  }

  if (getIsFinalizedOrder(order)) {
    // Partially filled is also not a real status
    if (order.executionData.partiallyFilled) {
      return {
        title: t`Partially Filled`,
        color: `var(${UI.COLOR_SUCCESS_TEXT})`,
        background: `var(${UI.COLOR_SUCCESS_BG})`,
      }
    }

    return {
      title: i18n._(titleMap[order.status]),
      color: order.status === OrderStatus.EXPIRED ? `var(${UI.COLOR_ALERT_TEXT})` : `var(${UI.COLOR_DANGER_TEXT})`,
      background: order.status === OrderStatus.EXPIRED ? `var(${UI.COLOR_ALERT_BG})` : `var(${UI.COLOR_DANGER_BG})`,
    }
  }

  // Cancelling is not a real order status
  if (order.isCancelling) {
    return {
      title: t`Cancelling...`,
      color: `var(${UI.COLOR_DANGER_TEXT})`,
      background: `var(${UI.COLOR_DANGER_BG})`,
    }
  }

  // Handle signing state
  if (order.status === OrderStatus.PRESIGNATURE_PENDING) {
    return {
      title: i18n._(titleMap[OrderStatus.PRESIGNATURE_PENDING]),
      color: `var(${UI.COLOR_ALERT_TEXT})`,
      background: `var(${UI.COLOR_ALERT_BG})`,
    }
  }

  // Handle unfillable orders
  if (order.isUnfillable) {
    return {
      title: t`Unfillable`,
      color: `var(${UI.COLOR_DANGER_TEXT})`,
      background: `var(${UI.COLOR_DANGER_BG})`,
    }
  }

  // Finally, map order status to their display version
  return {
    title: i18n._(titleMap[order.status]),
    color: order.status === OrderStatus.PENDING ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_TEXT})`,
    background:
      order.status === OrderStatus.PENDING ? `var(${UI.COLOR_TEXT_OPACITY_10})` : `var(${UI.COLOR_TEXT_OPACITY_10})`,
  }
}

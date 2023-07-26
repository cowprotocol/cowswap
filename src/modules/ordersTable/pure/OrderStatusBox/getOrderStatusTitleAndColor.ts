import { DefaultTheme } from 'styled-components/macro'

import { CONFIRMED_STATES, OrderStatus } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

const orderStatusTitleMap: { [key in OrderStatus]: string } = {
  [OrderStatus.PENDING]: 'Open',
  [OrderStatus.PRESIGNATURE_PENDING]: 'Signing',
  [OrderStatus.FULFILLED]: 'Filled',
  [OrderStatus.EXPIRED]: 'Expired',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.CREATING]: 'Creating',
  [OrderStatus.FAILED]: 'Failed',
  [OrderStatus.SCHEDULED]: 'Scheduled',
}

export function getOrderStatusTitleAndColor(order: ParsedOrder, theme: DefaultTheme): { title: string; color: string } {
  // We consider the order fully filled for display purposes even if not 100% filled
  // For this reason we use the flag to override the order status
  if (order.executionData.fullyFilled || order.status === OrderStatus.FULFILLED) {
    return {
      title: orderStatusTitleMap[OrderStatus.FULFILLED],
      color: theme.success,
    }
  }

  if (CONFIRMED_STATES.includes(order.status)) {
    // Partially filled is also not a real status
    if (order.executionData.partiallyFilled) {
      return {
        title: 'Partially Filled',
        color: theme.success,
      }
    }

    return {
      title: orderStatusTitleMap[order.status],
      color: order.status === OrderStatus.EXPIRED ? theme.warning : theme.danger,
    }
  }

  // Cancelling is not a real order status
  if (order.isCancelling) {
    return {
      title: 'Cancelling...',
      color: theme.text1,
    }
  }

  // Finally, map order status to their display version
  return {
    title: orderStatusTitleMap[order.status],
    color: order.status === OrderStatus.PENDING ? theme.text3 : theme.text1,
  }
}

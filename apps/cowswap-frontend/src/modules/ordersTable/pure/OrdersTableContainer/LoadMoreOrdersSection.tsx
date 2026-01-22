import { ReactNode } from 'react'

import { AMOUNT_OF_ORDERS_TO_FETCH } from '@cowprotocol/common-const'

import { Trans } from '@lingui/react/macro'

import { useLoadMoreOrders } from 'modules/orders/hooks/useLoadMoreOrders'
import { LoadMoreOrdersButton } from 'modules/ordersTable/pure/OrdersTableContainer/LoadMoreOrdersButton'

import * as styledEl from './OrdersTableContainer.styled'

export function LoadMoreOrdersSection(): ReactNode {
  const { limit, hasMoreOrders } = useLoadMoreOrders()

  return hasMoreOrders ? (
    <styledEl.ContentDescription>
      <p>
        {limit === AMOUNT_OF_ORDERS_TO_FETCH ? (
          <Trans>Only the {limit} most recent orders were searched.</Trans>
        ) : (
          <Trans>No open orders found in the {limit} most recent one.</Trans>
        )}
      </p>
      <p>
        <LoadMoreOrdersButton />
      </p>
    </styledEl.ContentDescription>
  ) : (
    <styledEl.ContentDescription>
      <p>
        <Trans>No more orders to fetch.</Trans>
      </p>
    </styledEl.ContentDescription>
  )
}

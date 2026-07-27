import { ReactNode } from 'react'

import { AMOUNT_OF_ORDERS_TO_FETCH } from '@cowprotocol/common-const'

import { Trans } from '@lingui/react/macro'
import { TabOrderTypes } from 'entities/routes/routes.atom'

import { useLoadMoreTableOrders } from '../../../../hooks/useLoadMoreTableOrders'
import * as styledEl from '../../Container/OrdersTableContainer.styled'
import { LoadMoreOrdersButton } from '../Button/LoadMoreOrdersButton'

export interface LoadMoreOrdersSectionProps {
  totalOpenOrders: number
  orderType: TabOrderTypes
}

export function LoadMoreOrdersSection({ totalOpenOrders, orderType }: LoadMoreOrdersSectionProps): ReactNode {
  const { limit, hasMoreOrders } = useLoadMoreTableOrders(orderType)

  const paragraphs = hasMoreOrders ? (
    <>
      <p>
        {limit === AMOUNT_OF_ORDERS_TO_FETCH ? (
          <Trans>Only the {limit} most recent orders were searched.</Trans>
        ) : totalOpenOrders === 1 ? (
          <Trans>Found 1 open order in the {limit} most recent ones.</Trans>
        ) : (
          <Trans>
            Found {totalOpenOrders} open orders in the {limit} most recent ones.
          </Trans>
        )}
      </p>
      <p>
        <LoadMoreOrdersButton orderType={orderType} />
      </p>
    </>
  ) : (
    <p>
      <Trans>That's all your open orders.</Trans>
    </p>
  )

  return <styledEl.ContentDescription>{paragraphs}</styledEl.ContentDescription>
}

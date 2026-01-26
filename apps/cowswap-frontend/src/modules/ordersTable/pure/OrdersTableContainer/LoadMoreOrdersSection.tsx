import { ReactNode } from 'react'

import { AMOUNT_OF_ORDERS_TO_FETCH } from '@cowprotocol/common-const'

import { Trans } from '@lingui/react/macro'

import { useLoadMoreOrders } from 'modules/orders/hooks/useLoadMoreOrders'

import { LoadMoreOrdersButton } from './LoadMoreOrdersButton'
import * as styledEl from './OrdersTableContainer.styled'

export interface LoadMoreOrdersSectionProps {
  totalOpenOrders: number
}

export function LoadMoreOrdersSection({ totalOpenOrders }: LoadMoreOrdersSectionProps): ReactNode {
  const { limit, hasMoreOrders } = useLoadMoreOrders()

  const paragraphs = hasMoreOrders ? (
    <>
      <p>
        {limit === AMOUNT_OF_ORDERS_TO_FETCH ? (
          <Trans>Only the {limit} most recent orders were searched.</Trans>
        ) : (
          <Trans>
            Found {totalOpenOrders} open orders in the {limit} most recent ones.
          </Trans>
        )}
      </p>
      <p>
        <LoadMoreOrdersButton />
      </p>
    </>
  ) : (
    <p>
      <Trans>That's all your open orders.</Trans>
    </p>
  )

  return <styledEl.ContentDescription>{paragraphs}</styledEl.ContentDescription>
}

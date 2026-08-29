import { ReactNode } from 'react'

import { AMOUNT_OF_ORDERS_TO_FETCH } from '@cowprotocol/common-const'

import { Plural, Trans } from '@lingui/react/macro'
import { TabOrderTypes } from 'entities/routes/routes.atom'

import { useLoadMoreOrders } from 'modules/orders'

import * as styledEl from '../../Container/OrdersTableContainer.styled'
import { LoadMoreOrdersButton } from '../Button/LoadMoreOrdersButton'

export interface LoadMoreOrdersSectionProps {
  totalOpenOrders: number
  orderType: TabOrderTypes
}

export function LoadMoreOrdersSection({ totalOpenOrders, orderType }: LoadMoreOrdersSectionProps): ReactNode {
  const { limit, hasMoreOrders, isLoading, loadMore } = useLoadMoreOrders(orderType)

  const paragraphs = hasMoreOrders ? (
    <>
      <p>
        {limit === AMOUNT_OF_ORDERS_TO_FETCH ? (
          <Trans>Only the {limit} most recent orders were searched.</Trans>
        ) : (
          <Trans>
            Found{' '}
            <Plural
              value={totalOpenOrders}
              one="# open order"
              few="# open orders"
              many="# open orders"
              other="# open orders"
            />{' '}
            in the {limit} most recent ones.
          </Trans>
        )}
      </p>
      <p>
        <LoadMoreOrdersButton disabled={isLoading || !hasMoreOrders} onClick={loadMore} />
      </p>
    </>
  ) : (
    <p>
      <Trans>That's all your open orders.</Trans>
    </p>
  )

  return <styledEl.ContentDescription>{paragraphs}</styledEl.ContentDescription>
}

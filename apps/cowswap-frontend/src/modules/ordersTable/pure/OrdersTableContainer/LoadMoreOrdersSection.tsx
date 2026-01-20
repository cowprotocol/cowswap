import { ReactNode } from 'react'

import { ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { useLoadMoreOrders } from 'modules/orders/hooks/useLoadMoreOrders'

import * as styledEl from './OrdersTableContainer.styled'

import { OrderTabId } from '../../const/tabs'

interface LoadMoreOrdersSectionProps {
  currentTab: OrderTabId
}

export function LoadMoreOrdersSection({ currentTab }: LoadMoreOrdersSectionProps): ReactNode {
  const { loadMore, hasMoreOrders, isLoading } = useLoadMoreOrders()

  // if (orderType !== TabOrderTypes.LIMIT && orderType !== TabOrderTypes.ADVANCED) return false

  // if (!hasHydratedOrders && (!orders || orders.length === 0)) return false

  return currentTab === OrderTabId.open && hasMoreOrders ? (
    <styledEl.LoadMoreSection>
      <styledEl.LoadMoreMessage>
        {currentTab === OrderTabId.open ? (
          <Trans>No open orders found. You can try again by clicking the "Load More" button.</Trans>
        ) : (
          <Trans>No open orders found in your orders history.</Trans>
        )}
      </styledEl.LoadMoreMessage>
      <ButtonPrimary onClick={loadMore} disabled={!hasMoreOrders || isLoading} style={{ marginTop: '16px' }}>
        <Trans>Load More</Trans>
      </ButtonPrimary>
    </styledEl.LoadMoreSection>
  ) : null
}

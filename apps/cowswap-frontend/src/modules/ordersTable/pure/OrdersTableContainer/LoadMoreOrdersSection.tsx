import { ReactNode } from 'react'

import { ButtonPrimary, Media } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { useApiOrders } from 'modules/orders/hooks/useApiOrders'
import { useLoadMoreOrders } from 'modules/orders/hooks/useLoadMoreOrders'

import { OrderTabId } from '../../const/tabs'

interface LoadMoreOrdersSectionProps {
  currentTab: OrderTabId
}

export function LoadMoreOrdersSection({ currentTab }: LoadMoreOrdersSectionProps): ReactNode {
  const { loadMore, hasMoreOrders, isLoading } = useLoadMoreOrders()
  const orders = useApiOrders()

  // if (orderType !== TabOrderTypes.LIMIT && orderType !== TabOrderTypes.ADVANCED) return false

  // if (!hasHydratedOrders && (!orders || orders.length === 0)) return false

  console.log(currentTab === OrderTabId.open, hasMoreOrders, orders.length > 0)

  return currentTab === OrderTabId.open && hasMoreOrders && orders.length > 0 ? (
    <LoadMoreButton onClick={loadMore} disabled={isLoading}>
      <Trans>Load More</Trans>
    </LoadMoreButton>
  ) : null
}

export const LoadMoreButton = styled(ButtonPrimary)`
  margin: 10px auto 0;
  padding: 0 64px;
  width: auto;

  ${Media.upToExtraSmall()} {
    width: 100%;
    padding: 0 16px;
  }
`

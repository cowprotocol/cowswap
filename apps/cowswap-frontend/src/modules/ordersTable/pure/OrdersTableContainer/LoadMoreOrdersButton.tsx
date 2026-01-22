import { ReactNode } from 'react'

import { ButtonPrimary, Media } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

// import { useApiOrders } from 'modules/orders/hooks/useApiOrders'
import { useLoadMoreOrders } from 'modules/orders/hooks/useLoadMoreOrders'

export function LoadMoreOrdersButton(): ReactNode {
  const { loadMore, hasMoreOrders, isLoading } = useLoadMoreOrders()
  // const orders = useApiOrders()

  // if (orders.length === 0) return null

  console.log({ hasMoreOrders, isLoading })

  return (
    <LoadMoreButton onClick={loadMore} disabled={isLoading || !hasMoreOrders}>
      <Trans>Search older orders</Trans>
    </LoadMoreButton>
  )
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

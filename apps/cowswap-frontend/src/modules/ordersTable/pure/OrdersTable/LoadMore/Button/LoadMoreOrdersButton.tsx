import { ReactNode } from 'react'

import { ButtonPrimary, Media } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { TabOrderTypes } from 'entities/routes/routes.atom'
import styled from 'styled-components/macro'

import { useLoadMoreTableOrders } from '../../../../hooks/useLoadMoreTableOrders'

export interface LoadMoreOrdersButtonProps {
  orderType: TabOrderTypes
}

export function LoadMoreOrdersButton({ orderType }: LoadMoreOrdersButtonProps): ReactNode {
  const { loadMore, hasMoreOrders, isLoading } = useLoadMoreTableOrders(orderType)

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

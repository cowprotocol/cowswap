import { ReactNode } from 'react'

import cowMeditatingV2 from '@cowprotocol/assets/cow-swap/meditating-cow-v2.svg'
import { CowSwapSafeAppLink } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import * as styledEl from './OrdersTableContainer.styled'

import { OrderTabId } from '../../const/tabs'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'
import { TabOrderTypes } from '../../types'

function getSectionTitle(currentTab: OrderTabId): string {
  return currentTab === OrderTabId.all
    ? 'No orders'
    : currentTab === OrderTabId.unfillable
      ? 'No unfillable orders'
      : currentTab === OrderTabId.open
        ? 'No open orders'
        : 'No order history'
}

interface NoOrdersContentProps {
  currentTab: OrderTabId
  searchTerm?: string
}

export function NoOrdersContent({ currentTab, searchTerm }: NoOrdersContentProps): ReactNode {
  const { orderType, isSafeViaWc, displayOrdersOnlyForSafeApp, injectedWidgetParams } = useOrdersTableState() || {}

  const emptyOrdersImage = injectedWidgetParams?.images?.emptyOrders

  return (
    <styledEl.Content>
      <span>
        {emptyOrdersImage ? (
          <img src={emptyOrdersImage} alt="There are no orders" />
        ) : (
          <styledEl.MeditatingCowImg src={cowMeditatingV2} alt="Cow meditating ..." />
        )}
      </span>
      <h3>
        <Trans>{searchTerm ? 'No matching orders found' : getSectionTitle(currentTab)}</Trans>
      </h3>
      <p>
        {displayOrdersOnlyForSafeApp && isSafeViaWc ? (
          <Trans>
            Use the <CowSwapSafeAppLink /> to see {currentTab === OrderTabId.history ? 'orders history' : 'your orders'}
          </Trans>
        ) : searchTerm ? (
          <Trans>Try adjusting your search term or clearing the filter</Trans>
        ) : (
          <>
            <Trans>
              You don't have any{' '}
              {currentTab === OrderTabId.unfillable ? 'unfillable' : currentTab === OrderTabId.open ? 'open' : ''}{' '}
              orders at the moment.
            </Trans>{' '}
            {(currentTab === OrderTabId.open || currentTab === OrderTabId.all) && (
              <>
                <br />
                <Trans>Time to create a new one!</Trans>{' '}
                {orderType === TabOrderTypes.LIMIT ? (
                  <styledEl.ExternalLinkStyled href="https://cow.fi/learn/limit-orders-explained">
                    <Trans>Learn more</Trans>
                    <styledEl.ExternalArrow />
                  </styledEl.ExternalLinkStyled>
                ) : null}
              </>
            )}
          </>
        )}
      </p>
    </styledEl.Content>
  )
}

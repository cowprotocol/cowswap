import { ReactNode, memo } from 'react'

import { CowSwapSafeAppLink } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import Lottie from 'lottie-react'

import * as styledEl from './OrdersTableContainer.styled'

import { OrderTabId } from '../../const/tabs'
import { useNoOrdersAnimation } from '../../hooks/useNoOrdersAnimation'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'
import { TabOrderTypes } from '../../types'

interface NoOrdersDescriptionProps {
  currentTab: OrderTabId
  orderType: TabOrderTypes | undefined
  searchTerm: string | undefined
  isSafeViaWc: boolean | undefined
  displayOrdersOnlyForSafeApp: boolean | undefined
}

const NoOrdersDescription = memo(function NoOrdersDescription({
  currentTab,
  orderType,
  searchTerm,
  isSafeViaWc,
  displayOrdersOnlyForSafeApp,
}: NoOrdersDescriptionProps): ReactNode {
  if (displayOrdersOnlyForSafeApp && isSafeViaWc) {
    return (
      <Trans>
        Use the <CowSwapSafeAppLink /> to see {currentTab === OrderTabId.history ? 'orders history' : 'your orders'}
      </Trans>
    )
  }

  if (searchTerm) {
    return <Trans>Try adjusting your search term or clearing the filter</Trans>
  }

  return (
    <>
      <Trans>
        You don't have any{' '}
        {currentTab === OrderTabId.unfillable ? 'unfillable' : currentTab === OrderTabId.open ? 'open' : ''} orders at
        the moment.
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
  )
})

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
  hasHydratedOrders: boolean
  isDarkMode: boolean
}

export function NoOrdersContent({ currentTab, searchTerm, hasHydratedOrders, isDarkMode }: NoOrdersContentProps): ReactNode {
  const { orderType, isSafeViaWc, displayOrdersOnlyForSafeApp, injectedWidgetParams } = useOrdersTableState() || {}
  const emptyOrdersImage = injectedWidgetParams?.images?.emptyOrders
  const animationData = useNoOrdersAnimation({ emptyOrdersImage, hasHydratedOrders, isDarkMode })

  return (
    <styledEl.Content>
      <h3>
        <Trans>{searchTerm ? 'No matching orders found' : getSectionTitle(currentTab)}</Trans>
      </h3>
      <p>
        <NoOrdersDescription
          currentTab={currentTab}
          orderType={orderType}
          searchTerm={searchTerm}
          isSafeViaWc={isSafeViaWc}
          displayOrdersOnlyForSafeApp={displayOrdersOnlyForSafeApp}
        />
      </p>
      <styledEl.NoOrdersAnimation>
        {emptyOrdersImage ? (
          <img src={emptyOrdersImage} alt="There are no orders" />
        ) : animationData ? (
          <styledEl.NoOrdersLottieFrame aria-label="Animated cow reacts to empty order list">
            <Lottie animationData={animationData} loop autoplay />
          </styledEl.NoOrdersLottieFrame>
        ) : (
          <styledEl.NoOrdersLottieFrame aria-hidden="true" />
        )}
      </styledEl.NoOrdersAnimation>
    </styledEl.Content>
  )
}

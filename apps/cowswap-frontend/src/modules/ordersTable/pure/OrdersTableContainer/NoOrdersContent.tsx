import { ReactNode, memo } from 'react'

import { CowSwapSafeAppLink } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
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
  const { t } = useLingui()
  const currentTabText = currentTab === OrderTabId.history ? t`orders history` : t`your orders`
  const orderStatusText =
    currentTab === OrderTabId.unfillable ? t`unfillable` : currentTab === OrderTabId.open ? t`open` : ''

  return displayOrdersOnlyForSafeApp && isSafeViaWc ? (
    <Trans>
      Use the <CowSwapSafeAppLink /> to see {currentTabText}
    </Trans>
  ) : searchTerm ? (
    <Trans>Try adjusting your search term or clearing the filter</Trans>
  ) : (
    <>
      <Trans>You don't have any {orderStatusText} orders at the moment.</Trans>{' '}
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
    ? t`No orders`
    : currentTab === OrderTabId.unfillable
      ? t`No unfillable orders`
      : currentTab === OrderTabId.open
        ? t`No open orders`
        : t`No order history`
}

interface NoOrdersContentProps {
  currentTab: OrderTabId
  searchTerm?: string
  hasHydratedOrders: boolean
  isDarkMode: boolean
}

export function NoOrdersContent({
  currentTab,
  searchTerm,
  hasHydratedOrders,
  isDarkMode,
}: NoOrdersContentProps): ReactNode {
  const { orderType, isSafeViaWc, displayOrdersOnlyForSafeApp, injectedWidgetParams } = useOrdersTableState() || {}
  const emptyOrdersImage = injectedWidgetParams?.images?.emptyOrders
  const animationData = useNoOrdersAnimation({ emptyOrdersImage, hasHydratedOrders, isDarkMode })
  const { t } = useLingui()

  return (
    <styledEl.Content>
      <h3>{searchTerm ? t`No matching orders found` : getSectionTitle(currentTab)}</h3>
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
          <img src={emptyOrdersImage} alt={t`There are no orders`} />
        ) : animationData ? (
          <styledEl.NoOrdersLottieFrame aria-label={t`Animated cow reacts to empty order list`}>
            <Lottie animationData={animationData} loop autoplay />
          </styledEl.NoOrdersLottieFrame>
        ) : (
          <styledEl.NoOrdersLottieFrame aria-hidden="true" />
        )}
      </styledEl.NoOrdersAnimation>
    </styledEl.Content>
  )
}

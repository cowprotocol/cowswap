import { ReactNode } from 'react'

import surprisedCowAnimationDark from '@cowprotocol/assets/lottie/surprised-cow-dark.json'
import surprisedCowAnimation from '@cowprotocol/assets/lottie/surprised-cow.json'
import { useTheme } from '@cowprotocol/common-hooks'
import { CowSwapSafeAppLink } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import Lottie from 'lottie-react'

import * as styledEl from './OrdersTableContainer.styled'

import { OrderTabId } from '../../const/tabs'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'
import { TabOrderTypes } from '../../types'

function renderDescription(
  displayOrdersOnlyForSafeApp: boolean | undefined,
  isSafeViaWc: boolean | undefined,
  searchTerm: string | undefined,
  currentTab: OrderTabId,
  orderType: TabOrderTypes | undefined,
): ReactNode {
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
        You don't have any {currentTab === OrderTabId.unfillable ? 'unfillable' : currentTab === OrderTabId.open ? 'open' : ''}{' '}
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
  )
}

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
  const theme = useTheme()
  const emptyOrdersImage = injectedWidgetParams?.images?.emptyOrders
  const animationData = theme.darkMode ? surprisedCowAnimationDark : surprisedCowAnimation

  return (
    <styledEl.Content>
      <h3>
        <Trans>{searchTerm ? 'No matching orders found' : getSectionTitle(currentTab)}</Trans>
      </h3>
      <p>{renderDescription(displayOrdersOnlyForSafeApp, isSafeViaWc, searchTerm, currentTab, orderType)}</p>
      <styledEl.NoOrdersAnimation>
        {emptyOrdersImage ? (
          <img src={emptyOrdersImage} alt="There are no orders" />
        ) : (
          <styledEl.NoOrdersLottieFrame aria-label="Animated cow reacts to empty order list">
            <Lottie animationData={animationData} loop autoplay />
          </styledEl.NoOrdersLottieFrame>
        )}
      </styledEl.NoOrdersAnimation>
    </styledEl.Content>
  )
}

import { ReactNode, useMemo } from 'react'

import cowMeditatingV2 from '@cowprotocol/assets/cow-swap/meditating-cow-v2.svg'
import imageConnectWallet from '@cowprotocol/assets/cow-swap/wallet-plus.svg'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { CowSwapSafeAppLink } from '@cowprotocol/ui'
import type { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'

import { Trans } from '@lingui/macro'
import SVG from 'react-inlinesvg'

import type { PendingOrdersPrices } from 'modules/orders/state/pendingOrdersPricesAtom'
import type { useGetSpotPrice } from 'modules/orders/state/spotPricesAtom'
import type { BalancesAndAllowances } from 'modules/tokens'
import { Web3Status } from 'modules/wallet/containers/Web3Status'

import { CancellableOrder } from 'common/utils/isOrderCancellable'

import { OrdersTable } from './OrdersTable'
import * as styledEl from './OrdersTableContainer.styled'
import { OrdersTabs } from './OrdersTabs'
import { OrderActions } from './types'

import { ALL_ORDERS_TAB, HISTORY_TAB, OPEN_TAB, UNFILLABLE_TAB } from '../../const/tabs'
import { TabOrderTypes } from '../../types'
import { OrderTableItem } from '../../utils/orderTableGroupUtils'

interface OrdersTableContainerProps {
  isWalletConnected: boolean
  isSafeViaWc: boolean
  displayOrdersOnlyForSafeApp: boolean
  pendingActivities: string[]
  children?: ReactNode
  orderType: TabOrderTypes
  injectedWidgetParams: Partial<CowSwapWidgetAppParams>
  tabs: Array<{ id: string; title: string; count: number; isActive?: boolean }>
  chainId: number
  orders: OrderTableItem[]
  selectedOrders: CancellableOrder[]
  allowsOffchainSigning: boolean
  balancesAndAllowances: BalancesAndAllowances
  orderActions: OrderActions
  currentPageNumber: number
  pendingOrdersPrices: PendingOrdersPrices
  getSpotPrice: ReturnType<typeof useGetSpotPrice>
  isTwapTable: boolean
  searchTerm?: string
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function OrdersTableContainer({
  chainId,
  orders,
  tabs,
  isWalletConnected,
  isSafeViaWc,
  displayOrdersOnlyForSafeApp,
  selectedOrders,
  allowsOffchainSigning,
  balancesAndAllowances,
  orderActions,
  currentPageNumber,
  pendingOrdersPrices,
  getSpotPrice,
  children,
  orderType,
  pendingActivities,
  injectedWidgetParams,
  searchTerm,
  isTwapTable,
}: OrdersTableContainerProps) {
  const currentTab = useMemo(() => {
    const activeTab = tabs.find((tab) => tab.isActive)
    return activeTab?.id || ALL_ORDERS_TAB.id
  }, [tabs])

  // TODO: Break down this large function into smaller functions
  // TODO: Reduce function complexity by extracting logic
  // TODO: Add proper return type annotation
  // eslint-disable-next-line max-lines-per-function, complexity, @typescript-eslint/explicit-function-return-type
  const content = () => {
    const emptyOrdersImage = injectedWidgetParams.images?.emptyOrders

    if (!isWalletConnected) {
      return (
        <styledEl.Content>
          <span>
            <SVG src={imageConnectWallet} description="connect wallet" />
          </span>
          <h3>
            <Trans>Connect a wallet</Trans>
          </h3>
          {!isInjectedWidget && (
            <>
              <p>
                <Trans>
                  To use {orderType} orders, please connect your wallet <br />
                  to one of our supported networks.
                </Trans>
              </p>

              <Web3Status pendingActivities={pendingActivities} />
            </>
          )}
        </styledEl.Content>
      )
    }

    if (orders.length === 0) {
      return (
        <styledEl.Content>
          <span>
            {emptyOrdersImage ? (
              <img src={emptyOrdersImage || cowMeditatingV2} alt="There are no orders" />
            ) : (
              <styledEl.MeditatingCowImg src={cowMeditatingV2} alt="Cow meditating ..." />
            )}
          </span>
          <h3>
            <Trans>
              {searchTerm
                ? 'No matching orders found'
                : currentTab === ALL_ORDERS_TAB.id
                  ? 'No orders'
                  : currentTab === UNFILLABLE_TAB.id
                    ? 'No unfillable orders'
                    : currentTab === OPEN_TAB.id
                      ? 'No open orders'
                      : 'No order history'}
            </Trans>
          </h3>
          <p>
            {displayOrdersOnlyForSafeApp && isSafeViaWc ? (
              <Trans>
                Use the <CowSwapSafeAppLink /> to see {currentTab === HISTORY_TAB.id ? 'orders history' : 'your orders'}
              </Trans>
            ) : searchTerm ? (
              <Trans>Try adjusting your search term or clearing the filter</Trans>
            ) : (
              <>
                <Trans>
                  You don't have any{' '}
                  {currentTab === UNFILLABLE_TAB.id ? 'unfillable' : currentTab === OPEN_TAB.id ? 'open' : ''} orders at
                  the moment.
                </Trans>{' '}
                {(currentTab === OPEN_TAB.id || currentTab === ALL_ORDERS_TAB.id) && (
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

    return (
      <OrdersTable
        currentTab={currentTab}
        isTwapTable={isTwapTable}
        chainId={chainId}
        orders={orders}
        selectedOrders={selectedOrders}
        allowsOffchainSigning={allowsOffchainSigning}
        balancesAndAllowances={balancesAndAllowances}
        orderActions={orderActions}
        currentPageNumber={currentPageNumber}
        pendingOrdersPrices={pendingOrdersPrices}
        getSpotPrice={getSpotPrice}
      />
    )
  }

  return (
    <styledEl.Wrapper>
      <styledEl.TopContainer>
        <styledEl.TabsContainer>
          <OrdersTabs tabs={tabs} isWalletConnected={isWalletConnected} />
          {children && <styledEl.RightContainer>{children}</styledEl.RightContainer>}
        </styledEl.TabsContainer>
      </styledEl.TopContainer>
      {content()}
    </styledEl.Wrapper>
  )
}

import { ReactNode, useMemo } from 'react'

import cowMeditatingV2 from '@cowprotocol/assets/cow-swap/meditating-cow-v2.svg'
import imageConnectWallet from '@cowprotocol/assets/cow-swap/wallet-plus.svg'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { CowSwapSafeAppLink, ExternalLink, Media, UI } from '@cowprotocol/ui'
import type { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'

import { Trans } from '@lingui/macro'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { Web3Status } from 'modules/wallet/containers/Web3Status'

import { OrdersTable } from './OrdersTable'
import { OrdersTabs } from './OrdersTabs'
import { OrderActions } from './types'

import { ALL_ORDERS_TAB, HISTORY_TAB, OPEN_TAB, UNFILLABLE_TAB } from '../../const/tabs'
import { TabOrderTypes } from '../../types'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 16px;
  width: 100%;
`

const Content = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  color: inherit;
  min-height: 490px;
  padding: 0;

  > span {
    --size: 130px;
    width: var(--size);
    height: var(--size);
    border-radius: var(--size);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin: 0 0 16px;
    color: inherit;
    transform: rotate(0);
    transition: transform 5s cubic-bezier(0.68, -0.55, 0.27, 1.55);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      background: var(${UI.COLOR_PAPER_DARKER});
      width: var(--size);
      height: var(--size);
      border-radius: var(--size);
      z-index: -1;
    }

    &:hover {
      transform: rotate(360deg);
    }

    > img,
    > svg {
      max-width: 100%;
      max-height: 100%;
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: inline;
    }

    > svg {
      padding: 28px;
      fill: currentColor;
      opacity: 0.5;
    }
  }

  > h3 {
    font-size: 26px;
    line-height: 1.2;
    font-weight: 500;
    margin: 0 auto 16px;
    text-align: center;
  }

  > p {
    font-size: 15px;
    line-height: 1.4;
    margin: 0 auto 21px;
    font-weight: 400;
    text-align: center;
    color: inherit;
  }
`

const MeditatingCowImg = styled.img`
  padding: 16px;
`

const TopContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 3px;

  ${Media.upToMedium()} {
    display: block;
    text-align: center;

    > h2 {
      margin-bottom: 15px !important;
    }
  }

  > h2 {
    font-size: 24px;
    margin: 0;
  }
`

const TabsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  ${Media.upToMedium()} {
    flex-direction: column;
    align-items: end;
    gap: 10px;
  }
`

const ExternalLinkStyled = styled(ExternalLink)`
  text-decoration: underline;
`

// Todo: Makes this arrow default behavior of <ExternalLink />
const ExternalArrow = styled.span`
  display: inline-block;
  &::after {
    content: ' ↗';
    display: inline-block;
    padding: 0 0 0 1px;
    font-weight: bold;
    font-size: 11px;
  }
`

const RightContainer = styled.div`
  display: flex;
  flex-flow: row wrap;

  ${Media.upToMedium()} {
    width: 100%;
    gap: 10px;
    flex-flow: column-reverse wrap;
  }
`

interface OrdersProps {
  isWalletConnected: boolean
  isSafeViaWc: boolean
  displayOrdersOnlyForSafeApp: boolean
  pendingActivities: string[]
  children?: ReactNode
  orderType: TabOrderTypes
  injectedWidgetParams: Partial<CowSwapWidgetAppParams>
  tabs: Array<{ id: string; title: string; count: number; isActive?: boolean }>
  chainId: number
  orders: any[]
  selectedOrders: any[]
  allowsOffchainSigning: boolean
  balancesAndAllowances: any
  orderActions: OrderActions
  currentPageNumber: number
  pendingOrdersPrices: any
  getSpotPrice: any
  searchTerm?: string
}

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
}: OrdersProps) {
  const currentTab = useMemo(() => {
    const activeTab = tabs.find((tab) => tab.isActive)
    return activeTab?.id || ALL_ORDERS_TAB.id
  }, [tabs])

  const content = () => {
    const emptyOrdersImage = injectedWidgetParams.images?.emptyOrders

    if (!isWalletConnected) {
      return (
        <Content>
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
        </Content>
      )
    }

    if (orders.length === 0) {
      return (
        <Content>
          <span>
            {emptyOrdersImage ? (
              <img src={emptyOrdersImage || cowMeditatingV2} alt="There are no orders" />
            ) : (
              <MeditatingCowImg src={cowMeditatingV2} alt="Cow meditating ..." />
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
                      <ExternalLinkStyled href="https://cow-protocol.medium.com/how-to-user-cow-swaps-surplus-capturing-limit-orders-24324326dc9e">
                        <Trans>Learn more</Trans>
                        <ExternalArrow />
                      </ExternalLinkStyled>
                    ) : null}
                  </>
                )}
              </>
            )}
          </p>
        </Content>
      )
    }

    return (
      <OrdersTable
        currentTab={currentTab}
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
    <Wrapper>
      <TopContainer>
        <TabsContainer>
          <OrdersTabs tabs={tabs} />
          <RightContainer>{children}</RightContainer>
        </TabsContainer>
      </TopContainer>
      {content()}
    </Wrapper>
  )
}

import { ReactNode } from 'react'

import cowMeditatingV2 from '@cowprotocol/assets/cow-swap/meditating-cow-v2.svg'
import imageConnectWallet from '@cowprotocol/assets/cow-swap/wallet-plus.svg'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { ExternalLink } from '@cowprotocol/ui'
import { UI, CowSwapSafeAppLink, MY_ORDERS_ID } from '@cowprotocol/ui'
import type { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'

import { Trans } from '@lingui/macro'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { Web3Status } from 'modules/wallet/containers/Web3Status'

import { OrdersTable, OrdersTableProps } from './OrdersTable'
import { OrdersTabs, OrdersTabsProps } from './OrdersTabs'

import { TabOrderTypes } from '../../types'

const OrdersBox = styled.div`
  background: ${({ theme }) => (theme.isInjectedWidgetMode ? `var(${UI.COLOR_PAPER})` : 'transparent')};
  color: inherit;
  border: none;
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  box-shadow: none;
  position: relative;
  padding: ${({ theme }) => (theme.isInjectedWidgetMode ? '16px' : '0')};
  padding: ${({ theme }) => (theme.isInjectedWidgetMode ? '16px' : '0')};
  min-height: 200px;
  width: 100%;
  margin: 0 0 76px;
`

const Content = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
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
      background: var(${UI.COLOR_PRIMARY});
      opacity: 0.16;
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

const Header = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  grid-template-rows: max-content;
  align-items: center;
  gap: 3px;
  width: 100%;
  margin: 0 0 24px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: block;
    text-align: center;

    > h2 {
      margin-bottom: 15px!important;
    }
  `};

  > h2 {
    font-size: 24px;
    margin: 0;
  }
`

const TabsContainer = styled.div<{ withSingleChild: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  ${({ theme, withSingleChild }) =>
    !withSingleChild &&
    theme.mediaWidth.upToMedium`
      flex-direction: column-reverse;
      align-items: end;
      gap: 10px;
  `};
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
interface OrdersProps extends OrdersTabsProps, OrdersTableProps {
  isWalletConnected: boolean
  isOpenOrdersTab: boolean
  isSafeViaWc: boolean
  displayOrdersOnlyForSafeApp: boolean
  pendingActivities: string[]
  children?: ReactNode
  orderType: TabOrderTypes
  injectedWidgetParams: Partial<CowSwapWidgetAppParams>
}

export function OrdersTableContainer({
  chainId,
  orders,
  tabs,
  isWalletConnected,
  isSafeViaWc,
  displayOrdersOnlyForSafeApp,
  selectedOrders,
  isOpenOrdersTab,
  allowsOffchainSigning,
  balancesAndAllowances,
  orderActions,
  currentPageNumber,
  pendingOrdersPrices,
  getSpotPrice,
  children,
  orderType,
  pendingActivities,
  ordersPermitStatus,
  injectedWidgetParams,
}: OrdersProps) {
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
              <img src={injectedWidgetParams.images?.emptyOrders || cowMeditatingV2} alt="There are no orders" />
            ) : (
              <MeditatingCowImg src={cowMeditatingV2} alt="Cow meditating ..." />
            )}
          </span>
          <h3>
            <Trans>{isOpenOrdersTab ? 'No open orders' : 'No orders history'}</Trans>
          </h3>
          <p>
            {displayOrdersOnlyForSafeApp && isSafeViaWc ? (
              <Trans>
                Use the <CowSwapSafeAppLink /> to see {isOpenOrdersTab ? 'open orders' : 'orders history'}
              </Trans>
            ) : (
              <>
                <Trans>You don't have any {isOpenOrdersTab ? 'open' : ''} orders at the moment.</Trans> <br />
                <Trans>Time to create a new one!</Trans> {/* TODO: add link for Advanced orders also */}
                {orderType === TabOrderTypes.LIMIT ? (
                  <ExternalLinkStyled href="https://cow-protocol.medium.com/how-to-user-cow-swaps-surplus-capturing-limit-orders-24324326dc9e">
                    <Trans>Learn more</Trans>
                    <ExternalArrow />
                  </ExternalLinkStyled>
                ) : null}
              </>
            )}
          </p>
        </Content>
      )
    }

    return (
      <OrdersTable
        isOpenOrdersTab={isOpenOrdersTab}
        allowsOffchainSigning={allowsOffchainSigning}
        selectedOrders={selectedOrders}
        pendingOrdersPrices={pendingOrdersPrices}
        currentPageNumber={currentPageNumber}
        chainId={chainId}
        orders={orders}
        balancesAndAllowances={balancesAndAllowances}
        getSpotPrice={getSpotPrice}
        orderActions={orderActions}
        ordersPermitStatus={ordersPermitStatus}
      />
    )
  }

  return (
    <OrdersBox>
      <Header>
        <h2 id={MY_ORDERS_ID}>Your Orders</h2>
        <TabsContainer withSingleChild={!children}>
          {children || <div></div>}
          <OrdersTabs tabs={tabs} />
        </TabsContainer>
      </Header>

      {content()}
    </OrdersBox>
  )
}

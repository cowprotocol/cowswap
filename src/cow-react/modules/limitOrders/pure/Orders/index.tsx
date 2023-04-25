import styled from 'styled-components/macro'
import { OrdersTabs, OrdersTabsProps } from './OrdersTabs'
import { OrdersTable, OrdersTableProps } from './OrdersTable'
import { Widget } from '../Widget'
import { transparentize } from 'polished'
import cowMeditatingV2 from 'assets/cow-swap/meditating-cow-v2.svg'
import imageConnectWallet from 'assets/cow-swap/wallet-plus.svg'
import { Trans } from '@lingui/macro'
import { ExternalLink } from 'theme'
import SVG from 'react-inlinesvg'
import { Web3Status } from '@cow/modules/wallet/web3-react/containers/Web3Status'
import { Wrapper as Web3StatusWrapper } from '@cow/modules/wallet/api/pure/Web3StatusInner/styled'
import { ReactNode } from 'react'

const OrdersBox = styled(Widget)`
  min-height: 200px;
  width: 100%;
`

const Content = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => transparentize(0.8, theme.text3)};
  min-height: 490px;
  padding: 0;

  // Icon
  > span {
    --size: 130px;
    width: var(--size);
    height: var(--size);
    border-radius: var(--size);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 0 16px;
    background: ${({ theme }) => transparentize(0.8, theme.text3)};
    transform: rotate(0);
    transition: transform 5s cubic-bezier(0.68, -0.55, 0.27, 1.55);

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
      padding: 16px;
    }

    > svg {
      padding: 28px;
      fill: ${({ theme }) => transparentize(0.3, theme.text1)};
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
    color: ${({ theme }) => transparentize(0.3, theme.text1)};
  }

  ${Web3StatusWrapper} {
    margin: 0 auto;
  }
`

const Header = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
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
export interface OrdersProps extends OrdersTabsProps, OrdersTableProps {
  isWalletConnected: boolean
  isOpenOrdersTab: boolean
  children?: ReactNode
}

export function Orders({
  chainId,
  orders,
  tabs,
  isWalletConnected,
  selectedOrders,
  isOpenOrdersTab,
  balancesAndAllowances,
  orderActions,
  currentPageNumber,
  pendingOrdersPrices,
  getSpotPrice,
  children,
}: OrdersProps) {
  const content = () => {
    if (!isWalletConnected) {
      return (
        <Content>
          <span>
            <SVG src={imageConnectWallet} description="connect wallet" />
          </span>
          <h3>
            <Trans>Connect a wallet</Trans>
          </h3>
          <p>
            <Trans>
              To use limit orders, please connect your wallet <br />
              to one of our supported networks.
            </Trans>
          </p>

          <Web3Status />
        </Content>
      )
    }

    if (orders.length === 0) {
      return (
        <Content>
          <span>
            <img src={cowMeditatingV2} alt="Cow meditating ..." />
          </span>
          <h3>
            <Trans>{isOpenOrdersTab ? 'No open orders' : 'No order history'}</Trans>
          </h3>
          <p>
            <Trans>
              You don&apos;t have any {isOpenOrdersTab ? 'open' : ''} orders at the moment. <br />
              Create one for free!{' '}
              <ExternalLink href="https://cow-protocol.medium.com/how-to-user-cow-swaps-surplus-capturing-limit-orders-24324326dc9e">
                Learn more
                <ExternalArrow />
              </ExternalLink>
            </Trans>
          </p>
        </Content>
      )
    }

    return (
      <OrdersTable
        isOpenOrdersTab={isOpenOrdersTab}
        selectedOrders={selectedOrders}
        pendingOrdersPrices={pendingOrdersPrices}
        currentPageNumber={currentPageNumber}
        chainId={chainId}
        orders={orders}
        balancesAndAllowances={balancesAndAllowances}
        getSpotPrice={getSpotPrice}
        orderActions={orderActions}
      />
    )
  }

  return (
    <>
      <OrdersBox>
        <Header>
          <h2>Your Orders</h2>
          <TabsContainer withSingleChild={!children}>
            {children || <div></div>}
            <OrdersTabs tabs={tabs} />
          </TabsContainer>
        </Header>

        {content()}
      </OrdersBox>
    </>
  )
}

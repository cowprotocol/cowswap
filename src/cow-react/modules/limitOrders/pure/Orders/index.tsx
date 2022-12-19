import styled from 'styled-components/macro'
import { OrdersTabs, OrdersTabsProps } from './OrdersTabs'
import { OrdersTable, OrdersTableProps } from './OrdersTable'
import { Widget } from '../Widget'
import { transparentize } from 'polished'
import cowMeditatingV2 from 'assets/cow-swap/meditating-cow-v2.svg'
import { Trans } from '@lingui/macro'
import { ExternalLink } from 'theme'

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

    > img {
      max-width: 100%;
      max-height: 100%;
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: inline;
      padding: 16px;
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
    margin: 0 auto;
    font-weight: 400;
    text-align: center;
    opacity: 0.7;
  }
`

const Header = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  margin: 0 0 24px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-flow: column wrap;
    margin: 0 0 16px;
  `};

  > h2 {
    font-size: 24px;
    margin: 0;
  }
`
export interface OrdersProps extends OrdersTabsProps, OrdersTableProps {
  isWalletConnected: boolean
  isOpenOrdersTab: boolean
}

export function Orders({
  chainId,
  orders,
  tabs,
  isWalletConnected,
  isOpenOrdersTab,
  balancesAndAllowances,
  getShowCancellationModal,
  currentPageNumber,
}: OrdersProps) {
  const content = () => {
    if (!isWalletConnected) {
      return (
        <Content>
          <p>To use limit orders, please connect your wallet to one of our supported networks.</p>
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
              <ExternalLink href="https://cow-protocol.medium.com/how-to-user-cow-swaps-surplus-capturing-limit-orders-24324326dc9e">
                Create one for free!
              </ExternalLink>
            </Trans>
          </p>
        </Content>
      )
    }

    return (
      <OrdersTable
        currentPageNumber={currentPageNumber}
        chainId={chainId}
        orders={orders}
        balancesAndAllowances={balancesAndAllowances}
        getShowCancellationModal={getShowCancellationModal}
      />
    )
  }

  return (
    <>
      <OrdersBox>
        <Header>
          <h2>Your Orders</h2>
          <OrdersTabs tabs={tabs} />
        </Header>

        {content()}
      </OrdersBox>
    </>
  )
}

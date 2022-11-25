import styled from 'styled-components/macro'
import * as styledEl from './styled'
import { OrdersTabs, OrdersTabsProps } from './OrdersTabs'
import { OrdersTable, OrdersTableProps } from './OrdersTable'
import { Content } from './OrdersTable.styled'
import cowMeditatingV2 from 'assets/cow-swap/meditating-cow-v2.svg'

export const Header = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  margin: 0 0 24px;

  > h2 {
    font-size: 24px;
    margin: 0;
  }
`
export interface OrdersProps extends OrdersTabsProps, OrdersTableProps {
  isWalletConnected: boolean
}

export function Orders({ orders, tabs, isWalletConnected }: OrdersProps) {
  const content = () => {
    if (!isWalletConnected) {
      return (
        <Content>
          <p>Please connect your wallet to view orders</p>
        </Content>
      )
    }

    // TODO: Check if no orders + order history tab is active. To show a different icon & message.
    if (orders.length === 0) {
      return (
        <Content>
          <span>
            <img src={cowMeditatingV2} alt="Cow meditating ..." />
          </span>
          <h3>No open orders</h3>
          <p>
            You don&apos;t have any open orders at the moment. <br />
            Create one for free!
          </p>
        </Content>
      )
    }

    return <OrdersTable orders={orders} />
  }

  return (
    <>
      <styledEl.Orders>
        <Header>
          <h2>Your Orders</h2>
          <OrdersTabs tabs={tabs} />
        </Header>

        {content()}
      </styledEl.Orders>
    </>
  )
}

import styled from 'styled-components/macro'
import * as styledEl from './styled'
import { OrdersTabs, OrdersTabsProps } from './OrdersTabs'
import { OrdersTable, OrdersTableProps } from './OrdersTable'

export const Header = styled.span`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  width: 100%;
  margin: 0 0 10px;

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
      return <styledEl.EmptyOrdersMessage>Please connect your wallet to view orders</styledEl.EmptyOrdersMessage>
    }

    if (orders.length === 0) {
      return <styledEl.EmptyOrdersMessage>You have no orders yet</styledEl.EmptyOrdersMessage>
    }

    return <OrdersTable orders={orders} />
  }

  return (
    <>
      <styledEl.Orders>
        <Header>
          <h2>Orders</h2>
          <OrdersTabs tabs={tabs} />
        </Header>

        {content()}
      </styledEl.Orders>
    </>
  )
}

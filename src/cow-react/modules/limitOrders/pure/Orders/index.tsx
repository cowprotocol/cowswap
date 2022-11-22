import { OrdersTabs, OrdersTabsProps } from './OrdersTabs'
import { OrdersTable, OrdersTableProps } from './OrdersTable'
import styled from 'styled-components/macro'
import { Widget } from '../Widget'

const OrdersBox = styled(Widget)`
  min-height: 200px;
  width: 100%;
`

const OrdersTitle = styled.h3`
  margin: 0 0 20px 0;
`

const EmptyOrdersMessage = styled.p`
  margin: 10px 20px;
  font-size: 18px;
  font-weight: 600;
`

export interface OrdersProps extends OrdersTabsProps, OrdersTableProps {
  isWalletConnected: boolean
}

export function Orders({ orders, tabs, isWalletConnected, balancesAndAllowances }: OrdersProps) {
  const content = () => {
    if (!isWalletConnected) {
      return <EmptyOrdersMessage>Please connect your wallet to view orders</EmptyOrdersMessage>
    }

    if (orders.length === 0) {
      return <EmptyOrdersMessage>You have no orders yet</EmptyOrdersMessage>
    }

    return <OrdersTable orders={orders} balancesAndAllowances={balancesAndAllowances} />
  }

  return (
    <>
      <OrdersBox>
        <OrdersTitle>Orders</OrdersTitle>
        <OrdersTabs tabs={tabs} />
        {content()}
      </OrdersBox>
    </>
  )
}

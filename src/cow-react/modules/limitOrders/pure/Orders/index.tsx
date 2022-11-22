import * as styledEl from './styled'
import { OrdersTabs, OrdersTabsProps } from './OrdersTabs'
import { OrdersTable, OrdersTableProps } from './OrdersTable'

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
        <OrdersTabs tabs={tabs} />
        {content()}
      </styledEl.Orders>
    </>
  )
}

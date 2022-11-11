import * as styledEl from './styled'
import { OrdersTabs, OrdersTabsProps } from './OrdersTabs'
import { OrdersTable, OrdersTableProps } from '@cow/modules/limitOrders/pure/Orders/OrdersTable'

export interface OrdersProps extends OrdersTabsProps, OrdersTableProps {}

export function Orders({ orders, tabs, onTabChange }: OrdersProps) {
  return (
    <>
      <styledEl.Orders>
        <p>Orders</p>
        <OrdersTabs tabs={tabs} onTabChange={onTabChange} />
        <br />
        <br />
        <OrdersTable orders={orders} />
      </styledEl.Orders>
    </>
  )
}

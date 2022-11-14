import * as styledEl from './styled'
import { OrdersTabs, OrdersTabsProps } from './OrdersTabs'
import { OrdersTable, OrdersTableProps } from '@cow/modules/limitOrders/pure/Orders/OrdersTable'

export interface OrdersProps extends OrdersTabsProps, OrdersTableProps {}

export function Orders({ orders, tabs, onTabChange }: OrdersProps) {
  return (
    <>
      <styledEl.Orders>
        <styledEl.OrdersTitle>Orders</styledEl.OrdersTitle>
        <OrdersTabs tabs={tabs} onTabChange={onTabChange} />
        {orders.length > 0 ? (
          <>
            <OrdersTable orders={orders} />
          </>
        ) : (
          <div>You have no orders yet</div>
        )}
      </styledEl.Orders>
    </>
  )
}

import * as styledEl from './styled'
import { OrdersTabs, OrdersTabsProps } from './OrdersTabs'

export type OrdersProps = OrdersTabsProps

export function Orders({ tabs, onTabChange }: OrdersProps) {
  return (
    <>
      <styledEl.Orders>
        <p>Orders</p>
        <OrdersTabs tabs={tabs} onTabChange={onTabChange} />
      </styledEl.Orders>
    </>
  )
}

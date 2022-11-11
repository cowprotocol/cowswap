import { Orders } from '../../pure/Orders'
import { OrderTab } from '@cow/modules/limitOrders/pure/Orders/OrdersTabs'
import { useOrders } from 'state/orders/hooks'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'

const tabs: OrderTab[] = [
  {
    title: 'Open orders',
    count: 5,
  },
  {
    title: 'Orders history',
    count: 0,
  },
]

export function OrdersWidget() {
  const { chainId, account } = useWeb3React()
  const allNonEmptyOrders = useOrders({ chainId })
  const accountLowerCase = account?.toLowerCase()

  // TODO: move it to hook
  const orders = useMemo(() => {
    return allNonEmptyOrders
      .filter((order) => order.owner.toLowerCase() === accountLowerCase)
      .sort((a, b) => Date.parse(b.creationTime) - Date.parse(a.creationTime))
  }, [accountLowerCase, allNonEmptyOrders])

  const onTabChange = () => {
    console.log('tab changed')
  }

  return <Orders onTabChange={onTabChange} tabs={tabs} orders={orders} />
}

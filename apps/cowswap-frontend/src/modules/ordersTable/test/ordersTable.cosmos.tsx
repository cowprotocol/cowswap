import { useSetAtom } from 'jotai/index'
import { useEffect } from 'react'

import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances'

import { msg } from '@lingui/core/macro'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { ordersMock } from './ordersTable.mock'

import { ordersTableStateAtom } from '../state/ordersTable.atoms'
import { OrderActions, TabOrderTypes } from '../state/ordersTable.types'
import { OrderTab, OrderTabId } from '../state/tabs/ordersTableTabs.constants'

const tabs: OrderTab[] = [
  {
    id: OrderTabId.open,
    title: msg`Open orders`,
    count: 5,
  },
  {
    id: OrderTabId.history,
    title: msg`Orders history`,
    count: 0,
    isActive: false,
  },
]

// TODO: set values
const balancesAndAllowances: BalancesAndAllowances = {
  balances: {},
  allowances: {},
  isLoading: false,
}

const orderActions: OrderActions = {
  getShowCancellationModal: (order) => {
    if (order.status === 'pending') {
      return () => alert('cancelling!')
    }
    return null
  },
  selectReceiptOrder(order: ParsedOrder) {
    console.log('selectReceiptOrder', order)
  },
  toggleOrderForCancellation(order) {
    console.log('toggleOrderForCancellation', order)
  },
  toggleOrdersForCancellation() {
    console.log('toggleAllOrdersForCancellation')
  },
  approveOrderToken() {
    console.log('approveOrderToken ')
  },
  getAlternativeOrderModalContext: function (_: ParsedOrder): null {
    console.log(`getShowRecreateModal`)
    return null
  },
}

function Wrapper(): null {
  const setOrdersTableState = useSetAtom(ordersTableStateAtom)

  useEffect(() => {
    setOrdersTableState({
      displayOrdersOnlyForSafeApp: false,
      currentPageNumber: 1,
      orders: ordersMock,
      filteredOrders: ordersMock,
      tabs: tabs,
      balancesAndAllowances: balancesAndAllowances,
      orderActions: orderActions,
      orderType: TabOrderTypes.LIMIT,
      currentTabId: OrderTabId.open,
      hasHydratedOrders: true,
    })
  }, [setOrdersTableState])

  return null
}

const Fixtures = {
  default: () => <Wrapper />,
}

export default Fixtures

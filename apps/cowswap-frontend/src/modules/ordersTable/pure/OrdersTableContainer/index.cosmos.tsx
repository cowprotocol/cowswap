import { useSetAtom } from 'jotai/index'
import { useEffect } from 'react'

import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances';
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { msg } from '@lingui/core/macro'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { ordersMock } from './orders.mock'

import { OrderTab, OrderTabId } from '../../const/tabs'
import { ordersTableStateAtom } from '../../state/ordersTableStateAtom'
import { OrderActions, TabOrderTypes } from '../../types'

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
      pendingActivitiesCount: 0,
      displayOrdersOnlyForSafeApp: false,
      pendingOrdersPrices: {},
      chainId: SupportedChainId.MAINNET,
      currentPageNumber: 1,
      orders: ordersMock,
      filteredOrders: ordersMock,
      tabs: tabs,
      isSafeViaWc: false,
      allowsOffchainSigning: true,
      isWalletConnected: true,
      selectedOrders: [],
      balancesAndAllowances: balancesAndAllowances,
      getSpotPrice: () => null,
      orderActions: orderActions,
      orderType: TabOrderTypes.LIMIT,
      injectedWidgetParams: {},
      isTwapTable: false,
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

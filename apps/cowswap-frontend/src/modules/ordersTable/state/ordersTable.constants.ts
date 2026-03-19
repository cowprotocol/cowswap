import { OrdersTableList, OrdersTableState } from 'modules/ordersTable/state/ordersTable.types'

import { OrderTabId } from 'common/state/routesState'

export const EMPTY_ORDERS_LIST = {
  [OrderTabId.OPEN]: [],
  [OrderTabId.HISTORY]: [],
  [OrderTabId.UNFILLABLE]: [],
  [OrderTabId.SIGNING]: [],
} as const satisfies OrdersTableList

export const EMPTY_ORDERS_TABLE_STATE = {
  reduxOrders: [],
  pendingOrders: [],
  orders: [],
  ordersList: EMPTY_ORDERS_LIST,
  filteredOrders: [],
  hasHydratedOrders: false,
  balancesAndAllowances: {
    isLoading: false,
    balances: {},
    allowances: {},
  },
} as const satisfies OrdersTableState

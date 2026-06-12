import { UiOrderType } from '@cowprotocol/types'

import { OrderTabId, TabOrderTypes } from 'common/state/routesState'

import { OrdersTableList, OrdersTableState } from './ordersTable.types'

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

export const UI_ORDER_TYPE_BY_TAB_ORDER_TYPE = {
  // This mapping is intentional.
  // The swap page and `AffectedPermitOrdersTable` component check open limit orders with partial approvals.
  [TabOrderTypes.SWAP]: UiOrderType.LIMIT,
  [TabOrderTypes.LIMIT]: UiOrderType.LIMIT,
  [TabOrderTypes.ADVANCED]: UiOrderType.TWAP,
  [TabOrderTypes.YIELD]: UiOrderType.LIMIT,
} as const satisfies Record<TabOrderTypes, UiOrderType>

import { atom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

import { HistoryStatusFilter } from '../../utils/getFilteredOrders'
import { OrdersTableFilters } from '../ordersTable.types'

export const DEFAULT_ORDERS_TABLE_FILTERS = {
  searchTerm: '',
  historyStatusFilter: HistoryStatusFilter.FILLED,
} as const satisfies OrdersTableFilters

export const ordersTableFiltersAtom = atom<OrdersTableFilters>(DEFAULT_ORDERS_TABLE_FILTERS)

export const { updateAtom: partiallyUpdateOrdersTableFiltersAtom } = atomWithPartialUpdate(ordersTableFiltersAtom)

// Note that ordersTableFiltersAtom could be reset by observing ordersTableOrderTypeAtom, tabParamAtom and/or locationPathnameAtom. However,
// that will result in the filters updating before the page is rendered. To prevent that and keep the old behavior where the page loads first and
// then resets the filters, we'll be manually resetting them from useOrdersTable() hook.

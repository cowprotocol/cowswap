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

/**
 * Used to trigger a reset of the orders table filters.
 */
export const ordersTableFiltersResetSignalAtom = atom(0)

export const resetOrdersTableFiltersAtom = atom(null, (get, set) => {
  set(ordersTableFiltersAtom, { ...DEFAULT_ORDERS_TABLE_FILTERS })
  set(ordersTableFiltersResetSignalAtom, (prevValue) => prevValue + 1)
})

// Note that ordersTableFiltersAtom could be reset by observing ordersTableOrderTypeAtom, tabParamAtom and/or locationPathnameAtom. However,
// that will result in the filters updating before the page is rendered. To prevent that and keep the old behavior where the page loads first and
// then resets the filters, we'll be manually resetting them from useOrdersTable() hook.

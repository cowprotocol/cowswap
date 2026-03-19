import { atom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'

import { observe } from 'jotai-effect'

import { locationPathnameAtom } from 'common/state/routesState'

import { HistoryStatusFilter } from '../../utils/getFilteredOrders'
import { OrdersTableFilters } from '../ordersTable.types'

export const DEFAULT_ORDERS_TABLE_FILTERS = {
  searchTerm: '',
  historyStatusFilter: HistoryStatusFilter.FILLED,
} as const satisfies OrdersTableFilters

export const ordersTableFiltersAtom = atom<OrdersTableFilters>(DEFAULT_ORDERS_TABLE_FILTERS)

export const { updateAtom: partiallyUpdateOrdersTableFiltersAtom } = atomWithPartialUpdate(ordersTableFiltersAtom)

ordersTableFiltersAtom.onMount = () => {
  return observe((get, set) => {
    get(locationPathnameAtom)

    // Reset filters when validated tab changes
    set(ordersTableFiltersAtom, DEFAULT_ORDERS_TABLE_FILTERS)
  }, jotaiStore)
}

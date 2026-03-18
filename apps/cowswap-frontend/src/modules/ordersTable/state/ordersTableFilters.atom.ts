import { atom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'

import { observe } from 'jotai-effect'

import { OrdersTableFilters } from './ordersTable.types'
import { ordersTableTabIdAtom } from './tabs/ordersTableTabs.atom'

import { HistoryStatusFilter } from '../utils/getFilteredOrders'

export const DEFAULT_ORDERS_TABLE_FILTERS = {
  searchTerm: '',
  historyStatusFilter: HistoryStatusFilter.FILLED,
} as const satisfies OrdersTableFilters

export const ordersTableFiltersAtom = atom<OrdersTableFilters>(DEFAULT_ORDERS_TABLE_FILTERS)

export const { updateAtom: partiallyUpdateOrdersTableFiltersAtom } = atomWithPartialUpdate(ordersTableFiltersAtom)

ordersTableFiltersAtom.onMount = () => {
  observe((get, set) => {
    get(ordersTableTabIdAtom)

    // Reset filters when validated tab changes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set(partiallyUpdateOrdersTableFiltersAtom as any, {
      searchTerm: '',
      historyStatusFilter: HistoryStatusFilter.FILLED,
    })
  }, jotaiStore)
}

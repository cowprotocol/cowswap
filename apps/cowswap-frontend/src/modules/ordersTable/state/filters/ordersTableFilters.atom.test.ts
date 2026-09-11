import { createStore } from 'jotai'

import {
  DEFAULT_ORDERS_TABLE_FILTERS,
  ordersTableFiltersAtom,
  ordersTableFiltersResetSignalAtom,
  resetOrdersTableFiltersAtom,
} from './ordersTableFilters.atom'

import { HistoryStatusFilter } from '../../utils/getFilteredOrders'

describe('resetOrdersTableFiltersAtom', () => {
  it('restores default filters', () => {
    const store = createStore()

    store.set(ordersTableFiltersAtom, {
      searchTerm: 'USDC',
      historyStatusFilter: HistoryStatusFilter.ALL,
    })

    store.set(resetOrdersTableFiltersAtom)

    expect(store.get(ordersTableFiltersAtom)).toEqual(DEFAULT_ORDERS_TABLE_FILTERS)
    expect(store.get(ordersTableFiltersAtom)).not.toBe(DEFAULT_ORDERS_TABLE_FILTERS)
  })

  it('increments the reset signal', () => {
    const store = createStore()

    expect(store.get(ordersTableFiltersResetSignalAtom)).toBe(0)

    store.set(resetOrdersTableFiltersAtom)

    expect(store.get(ordersTableFiltersResetSignalAtom)).toBe(1)
  })
})

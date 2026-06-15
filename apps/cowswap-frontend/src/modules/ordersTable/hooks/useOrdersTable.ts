import { useSetAtom } from 'jotai'
import { useLayoutEffect } from 'react'

import {
  DEFAULT_ORDERS_TABLE_FILTERS,
  ordersTableFiltersAtom,
} from 'modules/ordersTable/state/filters/ordersTableFilters.atom'

import { TabOrderTypes } from 'common/state/routesState'

import { ordersTableOrderTypeAtom } from '../state/ordersTableOrderType.atom'

export function useOrdersTable(orderType: TabOrderTypes): void {
  const setOrdersTableOrderType = useSetAtom(ordersTableOrderTypeAtom)
  const setOrdersTableFilters = useSetAtom(ordersTableFiltersAtom)

  // Using useEffect instead of useLayoutEffect will create a race condition between the page we are leaving and the one
  // we are going to (e.g. LIMIT => ADVANCED).
  useLayoutEffect(() => {
    setOrdersTableOrderType(orderType)
    setOrdersTableFilters(DEFAULT_ORDERS_TABLE_FILTERS)

    return () => {
      setOrdersTableOrderType(null)
      setOrdersTableFilters(DEFAULT_ORDERS_TABLE_FILTERS)
    }
  }, [orderType, setOrdersTableOrderType, setOrdersTableFilters])
}

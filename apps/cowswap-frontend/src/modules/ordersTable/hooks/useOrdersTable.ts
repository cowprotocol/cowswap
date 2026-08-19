import { useSetAtom } from 'jotai'
import { useLayoutEffect } from 'react'

import { TabOrderTypes } from 'entities/routes/routes.atom'

import {
  DEFAULT_ORDERS_TABLE_FILTERS,
  DEFAULT_MOBILE_ORDERS_TABLE_FILTERS,
  desktopOrdersTableFiltersAtom,
  mobileOrdersTableFiltersAtom,
  ordersTableFiltersAtom,
} from '../state/filters/ordersTableFilters.atom'
import { ordersTableOrderTypeAtom } from '../state/ordersTableOrderType.atom'

export function useOrdersTable(orderType: TabOrderTypes): void {
  const setOrdersTableOrderType = useSetAtom(ordersTableOrderTypeAtom)
  const setOrdersTableFilters = useSetAtom(ordersTableFiltersAtom)
  const setDesktopOrdersTableFilters = useSetAtom(desktopOrdersTableFiltersAtom)
  const setMobileOrdersTableFilters = useSetAtom(mobileOrdersTableFiltersAtom)

  // Using useEffect instead of useLayoutEffect will create a race condition between the page we are leaving and the one
  // we are going to (e.g. LIMIT => ADVANCED).
  useLayoutEffect(() => {
    setOrdersTableOrderType(orderType)
    setOrdersTableFilters(DEFAULT_ORDERS_TABLE_FILTERS)
    setDesktopOrdersTableFilters(DEFAULT_ORDERS_TABLE_FILTERS)
    setMobileOrdersTableFilters(DEFAULT_MOBILE_ORDERS_TABLE_FILTERS)
  }, [
    orderType,
    setDesktopOrdersTableFilters,
    setMobileOrdersTableFilters,
    setOrdersTableFilters,
    setOrdersTableOrderType,
  ])
}

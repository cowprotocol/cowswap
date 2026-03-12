import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

import { partiallyUpdateOrdersTableFiltersAtom } from '../state/ordersTable.atoms'
import { OrdersTableFilters } from '../state/ordersTable.types'
import { buildOrdersTableUrl } from '../utils/url/buildOrdersTableUrl'

export function usePartiallyUpdateOrdersTableFiltersAtom(): (filters: Partial<OrdersTableFilters>) => void {
  const location = useLocation()
  const navigate = useNavigate()
  const partiallyUpdateOrdersTableFilters = useSetAtom(partiallyUpdateOrdersTableFiltersAtom)

  return useCallback(
    (filters: Partial<OrdersTableFilters>) => {
      const resetPagination = filters.hasOwnProperty('searchTerm') || filters.hasOwnProperty('historyStatusFilter')

      if (resetPagination) {
        const url = buildOrdersTableUrl({ pathname: location.pathname, search: location.search }, { pageNumber: 1 })

        navigate(url, { replace: true })
      }

      partiallyUpdateOrdersTableFilters(filters)
    },
    [location, navigate, partiallyUpdateOrdersTableFilters],
  )
}

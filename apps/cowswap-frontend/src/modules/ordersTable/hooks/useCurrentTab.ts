import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useLocation } from 'react-router'

import { OrderTabId } from '../const/tabs'
import { OrdersTableList } from '../types'
import { parseOrdersTableUrl } from '../utils/parseOrdersTableUrl'

interface CurrentTabState {
  currentTabId: OrderTabId
  currentPageNumber: number
}

const DEFAULT_STATE: CurrentTabState = {
  currentTabId: OrderTabId.all,
  currentPageNumber: 1,
}

export function useCurrentTab(ordersList: OrdersTableList): CurrentTabState {
  const { account } = useWalletInfo()
  const location = useLocation()

  return useMemo(() => {
    if (!account) {
      return DEFAULT_STATE
    }

    const params = parseOrdersTableUrl(location.search)

    // If we're on a tab that becomes empty (signing or unfillable),
    // default to the all orders tab
    if (
      (params.tabId === OrderTabId.signing && !ordersList.signing.length) ||
      (params.tabId === OrderTabId.unfillable && !ordersList.unfillable.length)
    ) {
      return {
        currentTabId: OrderTabId.all,
        currentPageNumber: params.pageNumber || 1,
      }
    }

    return {
      currentTabId: params.tabId || OrderTabId.all,
      currentPageNumber: params.pageNumber || 1,
    }
  }, [location.search, ordersList.signing.length, ordersList.unfillable.length, account])
}

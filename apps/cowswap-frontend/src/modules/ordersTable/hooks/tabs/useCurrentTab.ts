import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useLocation } from 'react-router'

import { OrderTabId } from '../../state/tabs/ordersTableTabs.constants'
import { parseOrdersTableUrl } from '../../utils/url/parseOrdersTableUrl'

interface CurrentTabState {
  currentTabId: OrderTabId
  currentPageNumber: number
}

const DEFAULT_STATE: CurrentTabState = {
  currentTabId: OrderTabId.open,
  currentPageNumber: 1,
}

/**
 * Returns the current tab and page number based on URL parameters.
 *
 * This hook trusts the URL as the source of truth for which tab is active.
 * Auto-navigation away from empty tabs (e.g. signing -> open when all orders
 * are signed) is handled reactively by useRedirectWhenTabBecomesEmpty().
 */
export function useCurrentTab(): CurrentTabState {
  const { account } = useWalletInfo()
  const location = useLocation()

  return useMemo(() => {
    if (!account) {
      return DEFAULT_STATE
    }

    const params = parseOrdersTableUrl(location.search)

    return {
      currentTabId: params.tabId || OrderTabId.open,
      currentPageNumber: params.pageNumber || 1,
    }
  }, [location.search, account])
}

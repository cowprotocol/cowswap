import { ReactNode, useState } from 'react'

import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLocation } from 'react-router'

import { UnfillableOrdersUpdater } from 'common/updaters/orders/UnfillableOrdersUpdater'

import { SearchIcon, SearchInput, SearchInputContainer, StyledCloseIcon } from './styled'

import { ORDERS_TABLE_PAGE_SIZE, OrderTabId } from '../../const/tabs'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'
import { OrdersTableContainer } from '../../pure/OrdersTableContainer'
import { OrdersTableParams } from '../../types'
import { OrdersTableStateUpdater } from '../../updaters/OrdersTableStateUpdater'
import { tableItemsToOrders } from '../../utils/orderTableGroupUtils'
import { parseOrdersTableUrl } from '../../utils/parseOrdersTableUrl'
import { MultipleCancellationMenu } from '../MultipleCancellationMenu'
import { OrdersReceiptModal } from '../OrdersReceiptModal'

interface OrdersTableWidgetProps extends OrdersTableParams {
  children?: ReactNode
}

export function OrdersTableWidget(props: OrdersTableWidgetProps): ReactNode {
  const { children, ...stateParams } = props

  const location = useLocation()
  const isWindowVisible = useIsWindowVisible()

  const { account } = useWalletInfo()

  const [searchTerm, setSearchTerm] = useState('')

  const { filteredOrders, orders, currentTabId, pendingOrdersPrices } = useOrdersTableState() || {}

  const { pageNumber, tabId } = parseOrdersTableUrl(location.search)
  const isTabWithPending = tabId === OrderTabId.open || tabId === OrderTabId.all

  return (
    <>
      <UnfillableOrdersUpdater
        pageSize={ORDERS_TABLE_PAGE_SIZE}
        pageNumber={pageNumber}
        isTabWithPending={isTabWithPending}
        isWindowVisible={isWindowVisible}
      />
      <OrdersTableStateUpdater searchTerm={searchTerm} {...stateParams} />
      {children}
      <OrdersTableContainer searchTerm={searchTerm}>
        {(currentTabId === OrderTabId.open ||
          currentTabId === OrderTabId.all ||
          currentTabId === OrderTabId.unfillable) &&
          !!filteredOrders?.length && <MultipleCancellationMenu pendingOrders={tableItemsToOrders(filteredOrders)} />}

        {/* If account is not connected, don't show the search input */}
        {!!account && !!orders?.length && (
          <SearchInputContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Token symbol, address"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <StyledCloseIcon onClick={() => setSearchTerm('')} />}
          </SearchInputContainer>
        )}
      </OrdersTableContainer>

      {pendingOrdersPrices && <OrdersReceiptModal pendingOrdersPrices={pendingOrdersPrices} />}
    </>
  )
}

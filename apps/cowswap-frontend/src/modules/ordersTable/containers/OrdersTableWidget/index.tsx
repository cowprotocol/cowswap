import { ReactNode, useMemo, useState } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { OrderStatus } from 'legacy/state/orders/actions'

import { UnfillableOrdersUpdater } from 'common/updaters/orders/UnfillableOrdersUpdater'

import { SearchIcon, SearchInput, SearchInputContainer, StyledCloseIcon } from './styled'

import { ORDERS_TABLE_PAGE_SIZE, OrderTabId } from '../../const/tabs'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'
import { OrdersTableContainer } from '../../pure/OrdersTableContainer'
import { OrdersTableParams } from '../../types'
import { OrdersTableStateUpdater } from '../../updaters/OrdersTableStateUpdater'
import { tableItemsToOrders } from '../../utils/orderTableGroupUtils'
import { MultipleCancellationMenu } from '../MultipleCancellationMenu'
import { OrdersReceiptModal } from '../OrdersReceiptModal'

const tabsWithPendingOrders: OrderTabId[] = [OrderTabId.open, OrderTabId.all, OrderTabId.unfillable] as const

interface OrdersTableWidgetProps extends OrdersTableParams {
  children?: ReactNode
}

export function OrdersTableWidget(props: OrdersTableWidgetProps): ReactNode {
  const { children, ...stateParams } = props

  const { account } = useWalletInfo()

  const [searchTerm, setSearchTerm] = useState('')

  const { filteredOrders, orders, currentTabId, pendingOrdersPrices, currentPageNumber } = useOrdersTableState() || {}

  const isTabWithPending = !!currentTabId && tabsWithPendingOrders.includes(currentTabId)

  const pendingOrders = useMemo(() => {
    if (!isTabWithPending || !filteredOrders) return undefined

    return tableItemsToOrders(filteredOrders).filter((order) => {
      return order.status === OrderStatus.PENDING
    })
  }, [isTabWithPending, filteredOrders])

  return (
    <>
      {!!pendingOrders?.length && typeof currentPageNumber === 'number' && (
        <UnfillableOrdersUpdater
          orders={pendingOrders}
          pageSize={ORDERS_TABLE_PAGE_SIZE}
          pageNumber={currentPageNumber}
        />
      )}
      <OrdersTableStateUpdater searchTerm={searchTerm} {...stateParams} />
      {children}
      <OrdersTableContainer searchTerm={searchTerm}>
        {!!pendingOrders?.length && <MultipleCancellationMenu pendingOrders={pendingOrders} />}

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

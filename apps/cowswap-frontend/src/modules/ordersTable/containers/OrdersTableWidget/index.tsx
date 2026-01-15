import { ReactNode, useMemo, useState } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { OrderStatus } from 'legacy/state/orders/actions'

import { UnfillableOrdersUpdater } from 'common/updaters/orders/UnfillableOrdersUpdater'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { SearchIcon, SearchInput, SearchInputContainer, StyledCloseIcon, Checkbox, CheckboxLabel } from './styled'

import { ORDERS_TABLE_PAGE_SIZE, OrderTabId } from '../../const/tabs'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'
import { OrdersTableContainer } from '../../pure/OrdersTableContainer'
import { OrdersTableParams } from '../../types'
import { OrdersTableStateUpdater } from '../../updaters/OrdersTableStateUpdater'
import { tableItemsToOrders } from '../../utils/orderTableGroupUtils'
import { MultipleCancellationMenu } from '../MultipleCancellationMenu'
import { OrdersReceiptModal } from '../OrdersReceiptModal'

function getOrdersPageChunk(orders: ParsedOrder[], pageSize: number, pageNumber: number): ParsedOrder[] {
  const start = (pageNumber - 1) * pageSize
  const end = start + pageSize
  return orders.slice(start, end)
}

const tabsWithPendingOrders: OrderTabId[] = [OrderTabId.open, OrderTabId.unfillable] as const

interface OrdersTableWidgetProps extends OrdersTableParams {
  children?: ReactNode
}

export function OrdersTableWidget(props: OrdersTableWidgetProps): ReactNode {
  const { children, ...stateParams } = props

  const { account } = useWalletInfo()
  const { darkMode } = useTheme()

  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyFilled, setShowOnlyFilled] = useState(false)

  const handleShowOnlyFilledChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setShowOnlyFilled(e.target.checked)
  }

  const { filteredOrders, orders, currentTabId, pendingOrdersPrices, currentPageNumber } = useOrdersTableState() || {}

  const isTabWithPending = !!currentTabId && tabsWithPendingOrders.includes(currentTabId)

  const pendingOrders = useMemo(() => {
    if (!isTabWithPending || !filteredOrders || typeof currentPageNumber !== 'number') return undefined

    const currentPageItems = getOrdersPageChunk(
      tableItemsToOrders(filteredOrders),
      ORDERS_TABLE_PAGE_SIZE,
      currentPageNumber,
    )

    return currentPageItems.filter((order) => {
      return order.status === OrderStatus.PENDING
    })
  }, [isTabWithPending, filteredOrders, currentPageNumber])

  const hasPendingOrders = !!pendingOrders?.length

  // TODO: SearchInput's height = 36px, but parent is 32px, so this shifts the layout when Order history is selected.

  return (
    <>
      {hasPendingOrders && <UnfillableOrdersUpdater orders={pendingOrders} />}
      <OrdersTableStateUpdater searchTerm={searchTerm} showOnlyFilled={showOnlyFilled} {...stateParams} />
      {children}
      <OrdersTableContainer searchTerm={searchTerm} isDarkMode={darkMode}>
        {hasPendingOrders && <MultipleCancellationMenu pendingOrders={pendingOrders} />}

        {/* Should only filled checkbox in history tab (if there are orders) */}
        {currentTabId === OrderTabId.history && !!orders?.length && (
          <CheckboxLabel>
            <Checkbox type="checkbox" checked={showOnlyFilled} onChange={handleShowOnlyFilledChange} />
            {/* <Toggle
              isActive={showOnlyFilled}
              toggle={toggleShowOnlyFilled}
            />*/}
            <Trans>Show only filled orders</Trans>
          </CheckboxLabel>
        )}

        {/* If account is not connected, don't show the search input */}
        {!!account && !!orders?.length && (
          <SearchInputContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder={t`Token symbol, address`}
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

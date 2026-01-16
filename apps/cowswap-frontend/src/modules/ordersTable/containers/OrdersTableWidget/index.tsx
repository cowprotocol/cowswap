import { ReactNode, useMemo, useState, useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'

import { OrderStatus } from 'legacy/state/orders/actions'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { UnfillableOrdersUpdater } from 'common/updaters/orders/UnfillableOrdersUpdater'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { SearchIcon, SearchInput, SearchInputContainer, StyledCloseIcon, SelectContainer, Select } from './styled'

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

export function OrdersTableWidget(ordersTableParams: OrdersTableParams): ReactNode {
  const { i18n } = useLingui()
  const { account } = useWalletInfo()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()

  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyFilled, setShowOnlyFilled] = useState(false)

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setShowOnlyFilled(e.target.value === 'filled')
  }

  const { filteredOrders, orders, currentTabId, pendingOrdersPrices, currentPageNumber } = useOrdersTableState() || {}

  useEffect(() => {
    // When moving away from the history tab, reset the showOnlyFilled filter, as the UI for it won't be shown in other tabs:
    if (currentTabId !== OrderTabId.history) setShowOnlyFilled(false)
  }, [currentTabId])

  const pendingOrders = useMemo(() => {
    const isTabWithPending = !!currentTabId && tabsWithPendingOrders.includes(currentTabId)

    if (!isTabWithPending || !filteredOrders || typeof currentPageNumber !== 'number') return undefined

    const currentPageItems = getOrdersPageChunk(
      tableItemsToOrders(filteredOrders),
      ORDERS_TABLE_PAGE_SIZE,
      currentPageNumber,
    )

    return currentPageItems.filter((order) => {
      return order.status === OrderStatus.PENDING
    })
  }, [currentTabId, filteredOrders, currentPageNumber])

  const hasPendingOrders = !!pendingOrders?.length

  // Just render the OrdersTableContainer with nothing else if the user is not connected or the network is unsupported:
  return isProviderNetworkUnsupported || !account ? (
    <OrdersTableContainer />
  ) : (
    <>
      {hasPendingOrders && <UnfillableOrdersUpdater orders={pendingOrders} />}

      <OrdersTableStateUpdater searchTerm={searchTerm} showOnlyFilled={showOnlyFilled} {...ordersTableParams} />

      <OrdersTableContainer searchTerm={searchTerm} showOnlyFilled={showOnlyFilled}>
        {hasPendingOrders && <MultipleCancellationMenu pendingOrders={pendingOrders} />}

        {/* Show filters only if there are orders */}
        {!!orders?.length && (
          <>
            {/* Show onlyFilled select only in history tab */}
            {currentTabId === OrderTabId.history && (
              <SelectContainer>
                <Select name="onlyFilled" value={showOnlyFilled ? 'filled' : 'all'} onChange={handleSelectChange}>
                  <option value="all">{i18n._('All')}</option>
                  <option value="filled">{i18n._('Filled only')}</option>
                </Select>
              </SelectContainer>
            )}

            <SearchInputContainer>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder={t`Token symbol, address`}
                name="searchTerm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && <StyledCloseIcon onClick={() => setSearchTerm('')} />}
            </SearchInputContainer>
          </>
        )}
      </OrdersTableContainer>

      {pendingOrdersPrices && <OrdersReceiptModal pendingOrdersPrices={pendingOrdersPrices} />}
    </>
  )
}

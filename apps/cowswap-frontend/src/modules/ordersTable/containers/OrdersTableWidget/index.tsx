import { ReactNode, useState } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { SearchIcon, SearchInput, SearchInputContainer, StyledCloseIcon } from './styled'

import { OrderTabId } from '../../const/tabs'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'
import { OrdersTableContainer } from '../../pure/OrdersTableContainer'
import { OrdersTableParams } from '../../types'
import { OrdersTableStateUpdater } from '../../updaters/OrdersTableStateUpdater'
import { tableItemsToOrders } from '../../utils/orderTableGroupUtils'
import { MultipleCancellationMenu } from '../MultipleCancellationMenu'
import { OrdersReceiptModal } from '../OrdersReceiptModal'

interface OrdersTableWidgetProps extends OrdersTableParams {
  children?: ReactNode
}

export function OrdersTableWidget(props: OrdersTableWidgetProps): ReactNode {
  const { children, ...stateParams } = props

  const { account } = useWalletInfo()
  const { darkMode } = useTheme()

  const [searchTerm, setSearchTerm] = useState('')

  const { filteredOrders, orders, currentTabId, pendingOrdersPrices } = useOrdersTableState() || {}

  return (
    <>
      <OrdersTableStateUpdater searchTerm={searchTerm} {...stateParams} />
      {children}
      <OrdersTableContainer searchTerm={searchTerm} isDarkMode={darkMode}>
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

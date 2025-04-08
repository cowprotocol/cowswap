import { atom, useAtom } from 'jotai'
import React from 'react'

import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'


import { BlockchainNetwork, OrdersTableContext } from './context/OrdersTableContext'
import { OrdersTableWithData } from './OrdersTableWithData'
import { useTable } from './useTable'

import Spinner from '../../../components/common/Spinner'
import { TabItemInterface } from '../../../components/common/Tabs/Tabs'
import { ConnectionStatus } from '../../../components/ConnectionStatus'
import { Notification } from '../../../components/Notification'
import { useGetAccountOrders } from '../../../hooks/useGetOrders'
import ExplorerTabs from '../common/ExplorerTabs/ExplorerTabs'
import TablePagination from '../common/TablePagination'

const StyledTabLoader = styled.span`
  padding-left: 4px;
`

const StyledExplorerTabs = styled(ExplorerTabs)`
  margin: 1.6rem auto 0;
`

const tabItems = (isLoadingOrders: boolean): TabItemInterface[] => {
  return [
    {
      id: 1,
      tab: (
        <>
          Orders
          <StyledTabLoader>{isLoadingOrders && <Spinner spin size="1x" />}</StyledTabLoader>
        </>
      ),
      content: <OrdersTableWithData />,
    },
  ]
}

const WrapperExtraComponents = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  height: 100%;

  ${Media.upToSmall()} {
    width: 100%;
  }
`

export const selectedOrderStatusAtom = atom<string>('')

const STATUS_OPTIONS = ['open', 'filled', 'cancelled', 'cancelling', 'expired', 'signing']

export function OrderStatusPicker() {
  const [selectedOrderStatus, setSelectedOrderStatus] = useAtom(selectedOrderStatusAtom)

  return <div>
    <label htmlFor="order-status">Order Status:</label>
    <select
      id="order-status"
      value={selectedOrderStatus}
      onChange={(e) => {
        setSelectedOrderStatus(e.target.value)
      }}
    >
      <option value="">All</option>
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
      ))}
    </select>
  </div>
}

export const filterInputAtom = atom<string>('')

function FilterOrdersBar() {
  const [filterInput, setFilterInput] = useAtom(filterInputAtom)

  return (
    <input
      type="text"
      value={filterInput}
      onChange={(e) => {
        setFilterInput(e.target.value)
      }}
      placeholder="Filter orders..."
    />
  )
}

const ExtraComponentNode: React.ReactNode = (
  <WrapperExtraComponents>
    <FilterOrdersBar />
    <OrderStatusPicker />
    <TablePagination context={OrdersTableContext} />
  </WrapperExtraComponents>
)
interface Props {
  ownerAddress: string
  networkId: BlockchainNetwork
}

const OrdersTableWidget: React.FC<Props> = ({ ownerAddress, networkId }) => {
  const {
    state: tableState,
    setPageSize,
    handleNextPage,
    handlePreviousPage,
  } = useTable({ initialState: { pageOffset: 0, pageSize: 20 } })
  const {
    orders,
    isLoading,
    error,
    isThereNext: isThereNextOrder,
    totalCount,
  } = useGetAccountOrders(ownerAddress, tableState.pageSize, tableState.pageOffset, tableState.pageIndex)
  tableState['hasNextPage'] = isThereNextOrder
  tableState['totalCount'] = totalCount
  const addressAccountParams = { ownerAddress, networkId }

  return (
    <OrdersTableContext.Provider
      value={{
        addressAccountParams,
        data: orders,
        error,
        isLoading,
        tableState,
        setPageSize,
        handleNextPage,
        handlePreviousPage,
      }}
    >
      <ConnectionStatus />
      {error && <Notification type={error.type} message={error.message} />}
      <StyledExplorerTabs tabItems={tabItems(isLoading)} extra={ExtraComponentNode} extraPosition="both" />
    </OrdersTableContext.Provider>
  )
}

export default OrdersTableWidget

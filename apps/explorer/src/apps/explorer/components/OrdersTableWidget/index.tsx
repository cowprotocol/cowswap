import React from 'react'
import styled from 'styled-components'

import ExplorerTabs from 'apps/explorer/components/common/ExplorerTabs/ExplorerTabs'
import TablePagination from 'apps/explorer/components/common/TablePagination'
import { TabItemInterface } from 'components/common/Tabs/Tabs'
import { useTable } from './useTable'
import { OrdersTableWithData } from './OrdersTableWithData'
import { OrdersTableContext, BlockchainNetwork } from './context/OrdersTableContext'
import { useGetAccountOrders } from 'hooks/useGetOrders'
import Spinner from 'components/common/Spinner'
import { ConnectionStatus } from 'components/ConnectionStatus'
import { Notification } from 'components/Notification'

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
`

const ExtraComponentNode: React.ReactNode = (
  <WrapperExtraComponents>
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
  } = useGetAccountOrders(ownerAddress, tableState.pageSize, tableState.pageOffset, tableState.pageIndex)
  tableState['hasNextPage'] = isThereNextOrder
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
      <StyledExplorerTabs tabItems={tabItems(isLoading)} extra={ExtraComponentNode} />
    </OrdersTableContext.Provider>
  )
}

export default OrdersTableWidget

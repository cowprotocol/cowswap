import type { ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import type { AddressKey } from '@cowprotocol/cow-sdk'

import styled from 'styled-components/macro'

import { OrdersTableContext, type BlockchainNetwork } from './context/OrdersTableContext'
import { OrdersTableWithData } from './OrdersTableWithData'
import { useTable } from './useTable'

import Spinner from '../../../components/common/Spinner'
import { ConnectionStatus } from '../../../components/ConnectionStatus'
import { Notification } from '../../../components/Notification'
import { useGetAccountOrders } from '../../../hooks/useGetOrders'
import { TwapHistory } from '../../../modules/twap'
import { isTwapSupportedChain } from '../../../utils'
import ExplorerTabs from '../common/ExplorerTabs/ExplorerTabs'
import TablePagination from '../common/TablePagination'

import type { TabItemInterface } from '../../../components/common/Tabs/Tabs'

const StyledTabLoader = styled.span`
  padding-left: 4px;
`

const StyledExplorerTabs = styled(ExplorerTabs)`
  margin: 1.6rem auto 0;
`

interface OrdersTableWidgetProps {
  ownerAddress: AddressKey
  networkId: BlockchainNetwork
}

export function OrdersTableWidget({ ownerAddress, networkId }: OrdersTableWidgetProps): ReactNode {
  const { isTwapEoaEnabled } = useFeatureFlags()
  const showTwap = isTwapEoaEnabled === true && isTwapSupportedChain(networkId)
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
  const state = { ...tableState, hasNextPage: isThereNextOrder }
  const contextValue = {
    addressAccountParams: { ownerAddress, networkId },
    data: orders,
    error,
    isLoading,
    tableState: state,
    setPageSize,
    handleNextPage,
    handlePreviousPage,
  }
  const tabItems: TabItemInterface[] = [
    {
      id: 1,
      tab: (
        <>
          Orders
          <StyledTabLoader>{isLoading && <Spinner spin size="1x" />}</StyledTabLoader>
        </>
      ),
      content: <OrdersHistory />,
    },
  ]

  if (showTwap) {
    tabItems.push({
      id: 2,
      tab: 'TWAP',
      content: <TwapHistory key={`${networkId}:${ownerAddress}`} owner={ownerAddress} chainId={networkId} />,
    })
  }

  return (
    <OrdersTableContext.Provider value={contextValue}>
      <ConnectionStatus />
      {error && <Notification type={error.type} message={error.message} />}
      <StyledExplorerTabs tabItems={tabItems} />
    </OrdersTableContext.Provider>
  )
}

function OrdersHistory(): ReactNode {
  return (
    <>
      <TablePagination context={OrdersTableContext} />
      <OrdersTableWithData />
      <TablePagination context={OrdersTableContext} />
    </>
  )
}

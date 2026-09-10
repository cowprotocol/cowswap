import { useState, type ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import type { AddressKey } from '@cowprotocol/cow-sdk'

import { ORDERS_PAGE_SIZE } from 'explorer/const'
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
  const [selectedTab, setSelectedTab] = useState(1)
  const { isTwapEoaEnabled } = useFeatureFlags()
  const showTwap = isTwapEoaEnabled === true && isTwapSupportedChain(networkId)
  const {
    state: tableState,
    setPageSize,
    handleNextPage,
    handlePreviousPage,
  } = useTable({ initialState: { pageOffset: 0, pageSize: ORDERS_PAGE_SIZE } })
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
      content: <OrdersTableWithData />,
    },
  ]

  if (showTwap) {
    tabItems.push({
      id: 2,
      tab: 'TWAP',
      content: null,
    })
  }

  const renderTabs = (
    content?: ReactNode,
    pagination: ReactNode = <TablePagination context={OrdersTableContext} />,
  ): ReactNode => (
    <StyledExplorerTabs
      selectedTab={showTwap ? selectedTab : 1}
      updateSelectedTab={setSelectedTab}
      tabItems={tabItems.map((tab) => (tab.id === 2 ? { ...tab, content } : tab))}
      extra={pagination}
      extraPosition="both"
    />
  )

  return (
    <OrdersTableContext.Provider value={contextValue}>
      <ConnectionStatus />
      {error && <Notification type={error.type} message={error.message} />}
      {showTwap && selectedTab === 2 ? (
        <TwapHistory key={`${networkId}:${ownerAddress}`} owner={ownerAddress} chainId={networkId}>
          {renderTabs}
        </TwapHistory>
      ) : (
        renderTabs()
      )}
    </OrdersTableContext.Provider>
  )
}

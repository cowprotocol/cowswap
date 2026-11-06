import { useCallback, useEffect, type ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isSolanaAddress, isSolanaChain, type AddressKey } from '@cowprotocol/cow-sdk'

import { ORDERS_PAGE_SIZE, TAB_QUERY_PARAM_KEY, TWAP_TAB_QUERY_VALUE } from 'explorer/const'
import { useNavigate } from 'react-router'
import styled from 'styled-components/macro'

import { OrdersTableContext, type BlockchainNetwork } from './context/OrdersTableContext'
import { OrdersTableWithData } from './OrdersTableWithData'
import { useTable } from './useTable'

import Spinner from '../../../components/common/Spinner'
import { ConnectionStatus } from '../../../components/ConnectionStatus'
import { Notification } from '../../../components/Notification'
import { useGetAccountOrders } from '../../../hooks/useGetOrders'
import { useQuery, useUpdateQueryString } from '../../../hooks/useQuery'
import { TwapHistory } from '../../../modules/twap'
import ExplorerTabs from '../common/ExplorerTabs/ExplorerTabs'
import TablePagination from '../common/TablePagination'

import type { TabItemInterface } from '../../../components/common/Tabs/Tabs'

const ORDERS_TAB_ID = 1
const TWAP_TAB_ID = 2
const ORDERS_TAB_QUERY_VALUE = 'orders'

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
  const query = useQuery()
  const navigate = useNavigate()
  const updateQueryString = useUpdateQueryString()
  const selectedTab =
    query.get(TAB_QUERY_PARAM_KEY)?.toLowerCase() === TWAP_TAB_QUERY_VALUE ? TWAP_TAB_ID : ORDERS_TAB_ID
  const setSelectedTab = useCallback(
    (tabId: number) => {
      if (tabId === selectedTab) return

      updateQueryString(TAB_QUERY_PARAM_KEY, tabId === TWAP_TAB_ID ? TWAP_TAB_QUERY_VALUE : ORDERS_TAB_QUERY_VALUE)
    },
    [selectedTab, updateQueryString],
  )
  const { isTwapEoaEnabled } = useFeatureFlags()
  // TWAP is a ComposableCoW feature: nothing to fetch on Solana, nor for a Solana address viewed on an EVM chain.
  const isSolanaOwner = (!!networkId && isSolanaChain(networkId)) || isSolanaAddress(ownerAddress)
  const showTwapTab = isTwapEoaEnabled && !!networkId && !isSolanaOwner

  useEffect(() => {
    if (!isSolanaOwner || selectedTab !== TWAP_TAB_ID) return

    const search = new URLSearchParams(query)
    search.set(TAB_QUERY_PARAM_KEY, ORDERS_TAB_QUERY_VALUE)
    navigate({ search: search.toString() }, { replace: true })
  }, [isSolanaOwner, navigate, query, selectedTab])
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
      id: ORDERS_TAB_ID,
      tab: (
        <>
          Orders
          <StyledTabLoader>{isLoading && <Spinner spin size="1x" />}</StyledTabLoader>
        </>
      ),
      content: <OrdersTableWithData />,
    },
  ]

  if (showTwapTab) {
    tabItems.push({
      id: TWAP_TAB_ID,
      tab: 'TWAP',
      content: null,
    })
  }

  const renderTabs = (
    content?: ReactNode,
    pagination: ReactNode = <TablePagination context={OrdersTableContext} />,
  ): ReactNode => (
    <StyledExplorerTabs
      selectedTab={showTwapTab ? selectedTab : ORDERS_TAB_ID}
      updateSelectedTab={setSelectedTab}
      tabItems={tabItems.map((tab) => (tab.id === TWAP_TAB_ID ? { ...tab, content } : tab))}
      extra={pagination}
      extraPosition="both"
    />
  )

  return (
    <OrdersTableContext.Provider value={contextValue}>
      <ConnectionStatus />
      {error && <Notification type={error.type} message={error.message} />}
      {showTwapTab && selectedTab === TWAP_TAB_ID ? (
        <TwapHistory key={`${networkId}:${ownerAddress}`} owner={ownerAddress} chainId={networkId}>
          {renderTabs}
        </TwapHistory>
      ) : (
        renderTabs()
      )}
    </OrdersTableContext.Provider>
  )
}

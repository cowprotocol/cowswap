import React, { useCallback, useEffect, useState } from 'react'

import { faListUl, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'

import { BlockchainNetwork, TransactionsTableContext } from './context/TransactionsTableContext'
import { TransactionsTableWithData } from './TransactionsTableWithData'

import { Order } from '../../../api/operator'
import { BlockExplorerLink } from '../../../components/common/BlockExplorerLink'
import { LoadingWrapper } from '../../../components/common/LoadingWrapper'
import { TabIcon, TabItemInterface } from '../../../components/common/Tabs/Tabs'
import { ConnectionStatus } from '../../../components/ConnectionStatus'
import { Notification } from '../../../components/Notification'
import RedirectToSearch from '../../../components/RedirectToSearch'
import { useGetTxOrders, useTxOrderExplorerLink } from '../../../hooks/useGetOrders'
import { useQuery, useUpdateQueryString } from '../../../hooks/useQuery'
import { RedirectToNetwork, useNetworkId } from '../../../state/network'
import { TAB_QUERY_PARAM_KEY } from '../../const'
import { FlexContainerVar, TitleAddress } from '../../pages/styled'
import ExplorerTabs from '../common/ExplorerTabs/ExplorerTabs'
import { TransactionBatchGraph } from '../TransanctionBatchGraph'

interface Props {
  txHash: string
  networkId: BlockchainNetwork
  transactions?: Order[]
}

enum TabView {
  ORDERS = 1,
  GRAPH,
}

const DEFAULT_TAB = TabView[1]

function useQueryViewParams(): string {
  const query = useQuery()
  return query.get(TAB_QUERY_PARAM_KEY)?.toUpperCase() || DEFAULT_TAB  // if URL param empty will be used DEFAULT
}

const tabItems = (orders: Order[] | undefined, networkId: BlockchainNetwork, txHash: string): TabItemInterface[] => {
  return [
    {
      id: TabView.ORDERS,
      tab: <TabIcon title="Orders" iconFontName={faListUl} />,
      content: <TransactionsTableWithData />,
    },
    {
      id: TabView.GRAPH,
      tab: <TabIcon title="Graph" iconFontName={faProjectDiagram} />,
      content: <TransactionBatchGraph orders={orders} networkId={networkId} txHash={txHash} />,
    },
  ]
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export const TransactionsTableWidget: React.FC<Props> = ({ txHash }) => {
  const { orders, isLoading: isTxLoading, errorTxPresentInNetworkId, error } = useGetTxOrders(txHash)
  const networkId = useNetworkId() || undefined
  const [redirectTo, setRedirectTo] = useState(false)
  const tab = useQueryViewParams()
  const [tabViewSelected, setTabViewSelected] = useState<TabView>(TabView[tab] || TabView[DEFAULT_TAB]) // use DEFAULT when URL param is outside the enum
  const txHashParams = { networkId, txHash }
  const isZeroOrders = !!(orders && orders.length === 0)
  const notGpv2ExplorerData = useTxOrderExplorerLink(txHash, isZeroOrders)

  const updateQueryString = useUpdateQueryString()

  // Avoid redirecting until another network is searched again
  useEffect(() => {
    if (orders?.length || isTxLoading) return

    const timer = setTimeout(() => {
      setRedirectTo(true)
    }, 500)

    return (): void => clearTimeout(timer)
  })

  const onChangeTab = useCallback((tabId: number) => {
    const newTabViewName = TabView[tabId]
    if (!newTabViewName) return

    setTabViewSelected(TabView[newTabViewName])
  }, [])

  useEffect(
    () => updateQueryString(TAB_QUERY_PARAM_KEY, TabView[tabViewSelected].toLowerCase()),
    [tabViewSelected, updateQueryString]
  )

  if (errorTxPresentInNetworkId && networkId !== errorTxPresentInNetworkId) {
    return <RedirectToNetwork networkId={errorTxPresentInNetworkId} />
  }
  if (redirectTo) {
    return <RedirectToSearch data={notGpv2ExplorerData} from="tx" />
  }

  if (!orders?.length) {
    return <LoadingWrapper message="Loading transaction details" />
  }

  return (
    <>
      <FlexContainerVar>
        <h1>Transaction details</h1>
        <TitleAddress
          textToCopy={txHash}
          contentsToDisplay={
            <BlockExplorerLink type="transaction" networkId={networkId} identifier={txHash} showLogo />
          }
        />
      </FlexContainerVar>

      <ConnectionStatus />
      {error && <Notification type={error.type} message={error.message} />}
      <TransactionsTableContext.Provider
        value={{
          orders,
          txHashParams,
          error,
          isTxLoading,
        }}
      >
        <ExplorerTabs
          tabItems={tabItems(orders, networkId, txHash)}
          selectedTab={tabViewSelected}
          updateSelectedTab={(key: number): void => onChangeTab(key)}
        />
      </TransactionsTableContext.Provider>
    </>
  )
}

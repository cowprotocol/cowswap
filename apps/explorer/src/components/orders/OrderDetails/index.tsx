import React, { useCallback, useEffect, useState } from 'react'

import { SupportedChainId, CrossChainOrder } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { TruncatedText } from '@cowprotocol/ui/pure/TruncatedText'

import { TabItemInterface } from 'components/common/Tabs/Tabs'
import { ConnectionStatus } from 'components/ConnectionStatus'
import { Notification } from 'components/Notification'
import { FullDetailsTable } from 'components/orders/DetailsTable/FullDetailsTable'
import RedirectToSearch from 'components/RedirectToSearch'
import TablePagination from 'explorer/components/common/TablePagination'
import { useTable } from 'explorer/components/TokensTableWidget/useTable'
import { TAB_QUERY_PARAM_KEY } from 'explorer/const'
import { useQuery, useUpdateQueryString } from 'hooks/useQuery'
import { useLocation } from 'react-router'
import { useNetworkId } from 'state/network'
import { SWRResponse } from 'swr'
import { Errors } from 'types'
import { formatPercentage } from 'utils'

import { useCrossChainOrder } from 'modules/bridge'

import { Order, ORDER_FINAL_FAILED_STATUSES, Trade } from 'api/operator'

import { FillsTableContext } from './context/FillsTableContext'
import { TitleUid, WrapperExtraComponents, StyledExplorerTabs, TabContent } from './styled'
import { getBridgeTab, getFillsTab, getOverviewTab, TabView } from './tabs'

import { FlexContainerVar } from '../../../explorer/pages/styled'
import { VerboseDetails } from '../DetailsTable/VerboseDetails'
import { StatusLabel } from '../StatusLabel'

type Props = {
  order: Order | null
  trades: Trade[]
  isOrderLoading: boolean
  areTradesLoading: boolean
  errors: Errors
}

const DEFAULT_TAB = TabView[1]

function useQueryViewParams(): string {
  const query = useQuery()
  const param = query.get(TAB_QUERY_PARAM_KEY)?.toUpperCase()

  // Map unknown values to OVERVIEW
  if (!param || !TabView[param as keyof typeof TabView]) {
    return DEFAULT_TAB
  }

  return param
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
const tabItems = (
  chainId: SupportedChainId,
  _order: Order | null,
  crossChainOrderResponse: SWRResponse<CrossChainOrder | null | undefined>,
  trades: Trade[],
  areTradesLoading: boolean,
  isOrderLoading: boolean,
  onChangeTab: (tab: TabView) => void,
  isPriceInverted: boolean,
  invertPrice: Command,
): TabItemInterface[] => {
  const order = getOrderWithTxHash(_order, trades)
  const areTokensLoaded = Boolean(order?.buyToken && order?.sellToken)
  const isLoadingForTheFirstTime = isOrderLoading && !areTokensLoaded
  const filledPercentage = order?.filledPercentage && formatPercentage(order.filledPercentage)
  const showFills = order?.partiallyFillable && !order.txHash && trades.length > 1

  const { data: crossChainOrder, isLoading: crossChainOrderLoading } = crossChainOrderResponse

  const noTokens = Boolean(!isOrderLoading && order && !areTokensLoaded)

  const defaultDetails =
    order && areTokensLoaded ? (
      <FullDetailsTable chainId={chainId} order={order} showFillsButton={showFills} areTradesLoading={areTradesLoading}>
        <VerboseDetails
          order={order}
          showFillsButton={showFills}
          viewFills={() => onChangeTab(TabView.FILLS)}
          isPriceInverted={isPriceInverted}
          invertPrice={invertPrice}
        />
      </FullDetailsTable>
    ) : null

  const isBridging = !!order?.bridgeProviderId
  const isOrderInFinalStatus = !!order && ORDER_FINAL_FAILED_STATUSES.includes(order?.status)

  const overviewTabTitle =
    isBridging && !isOrderInFinalStatus ? (
      <TabContent>
        1. Swap <StatusLabel status={order.status} />
      </TabContent>
    ) : (
      <span>Overview</span>
    )
  const overviewTab = getOverviewTab(overviewTabTitle, defaultDetails, noTokens, isLoadingForTheFirstTime)

  // Swap & Bridge
  if (isBridging && !isOrderInFinalStatus) {
    return [overviewTab, getBridgeTab(order, crossChainOrder, crossChainOrderLoading)]
  }

  if (!showFills) {
    return [overviewTab]
  }

  const fillsTab = getFillsTab(filledPercentage, { order, areTokensLoaded, isPriceInverted, invertPrice })

  return [overviewTab, fillsTab]
}

/**
 * Get the order with txHash set if it has a single trade
 *
 * That is the case for any filled fill or kill or a partial fill that has a single trade
 */
function getOrderWithTxHash(order: Order | null, trades: Trade[]): Order | null {
  if (order && trades.length === 1) {
    return { ...order, txHash: trades[0].txHash || undefined, executionDate: trades[0].executionTime || undefined }
  }
  return order
}

const RESULTS_PER_PAGE = 10

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export const OrderDetails: React.FC<Props> = (props) => {
  const { order, isOrderLoading, areTradesLoading, errors, trades } = props
  const chainId = useNetworkId()
  const tab = useQueryViewParams()
  const [tabViewSelected, setTabViewSelected] = useState<TabView>(TabView[tab] || TabView[DEFAULT_TAB]) // use DEFAULT when URL param is outside the enum
  const {
    state: tableState,
    setPageSize,
    setPageOffset,
    handleNextPage,
    handlePreviousPage,
  } = useTable({ initialState: { pageOffset: 0, pageSize: RESULTS_PER_PAGE } })
  const [isPriceInverted, setIsPriceInverted] = useState(false)
  const invertPrice = useCallback((): void => setIsPriceInverted((prev) => !prev), [])

  const [redirectTo, setRedirectTo] = useState(false)
  const updateQueryString = useUpdateQueryString()
  const crossChainOrderResponse = useCrossChainOrder(order?.uid)

  tableState['hasNextPage'] = tableState.pageOffset + tableState.pageSize < trades.length
  tableState['totalResults'] = trades.length

  const ExtraComponentNode: React.ReactNode = (
    <WrapperExtraComponents>
      {tabViewSelected === TabView.FILLS && <TablePagination context={FillsTableContext} />}
    </WrapperExtraComponents>
  )

  // Avoid redirecting until another network is searched again
  useEffect(() => {
    if (order || isOrderLoading) return

    const timer = setTimeout(() => {
      setRedirectTo(true)
    }, 500)

    return () => clearTimeout(timer)
  })

  const onChangeTab = useCallback(
    (tabId: number) => {
      const newTabViewName = TabView[tabId]
      if (!newTabViewName) return

      updateQueryString(TAB_QUERY_PARAM_KEY, newTabViewName.toLowerCase())
      setTabViewSelected(TabView[newTabViewName])
    },
    [updateQueryString],
  )

  const location = useLocation()
  useEffect(() => {
    setTabViewSelected(TabView[tab])
  }, [location, tab])

  if (!chainId) {
    return null
  }

  if (redirectTo) {
    return <RedirectToSearch from="orders" />
  }

  return (
    <>
      <FlexContainerVar>
        <h1>{order && 'Order details'}</h1>{' '}
        {order && <TitleUid textToCopy={order.uid} contentsToDisplay={<TruncatedText>{order.uid}</TruncatedText>} />}
      </FlexContainerVar>

      <ConnectionStatus />
      {Object.keys(errors).map((key) => (
        <Notification key={key} type={errors[key].type} message={errors[key].message} />
      ))}
      <FillsTableContext.Provider
        value={{
          data: trades,
          isLoading: areTradesLoading,
          tableState,
          setPageSize,
          setPageOffset,
          handleNextPage,
          handlePreviousPage,
        }}
      >
        <StyledExplorerTabs
          className={`orderDetails-tab--${TabView[tabViewSelected].toLowerCase()}`}
          tabItems={tabItems(
            chainId,
            order,
            crossChainOrderResponse,
            trades,
            areTradesLoading,
            isOrderLoading,
            onChangeTab,
            isPriceInverted,
            invertPrice,
          )}
          selectedTab={tabViewSelected}
          updateSelectedTab={(key: number): void => onChangeTab(key)}
          extra={ExtraComponentNode}
        />
      </FillsTableContext.Provider>
    </>
  )
}

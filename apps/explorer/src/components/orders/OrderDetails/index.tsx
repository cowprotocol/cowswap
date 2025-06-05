import React, { useCallback, useEffect, useState } from 'react'

import { BridgeDetails, BridgeStatus } from '@cowprotocol/bridge'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { TruncatedText } from '@cowprotocol/ui/pure/TruncatedText'

import CowLoading from 'components/common/CowLoading'
import { TabItemInterface } from 'components/common/Tabs/Tabs'
import { ConnectionStatus } from 'components/ConnectionStatus'
import { Notification } from 'components/Notification'
import { DetailsTable } from 'components/orders/DetailsTable'
import { StatusLabel } from 'components/orders/StatusLabel'
import RedirectToSearch from 'components/RedirectToSearch'
import TablePagination from 'explorer/components/common/TablePagination'
import { useTable } from 'explorer/components/TokensTableWidget/useTable'
import { TAB_QUERY_PARAM_KEY } from 'explorer/const'
import { useQuery, useUpdateQueryString } from 'hooks/useQuery'
import { useLocation } from 'react-router'
import { useNetworkId } from 'state/network'
import { Errors } from 'types'
import { formatPercentage } from 'utils'

import { Order, Trade, OrderStatus } from 'api/operator'

import { FillsTableContext } from './context/FillsTableContext'
import { FillsTableWithData } from './FillsTableWithData'
import { TitleUid, WrapperExtraComponents, StyledExplorerTabs, TabContent, BridgeDetailsWrapper } from './styled'

import { FlexContainerVar } from '../../../explorer/pages/styled'
import { BridgeDetailsTable } from '../BridgeDetailsTable'

type Props = {
  order: Order | null
  trades: Trade[]
  isOrderLoading: boolean
  areTradesLoading: boolean
  errors: Errors
}

enum TabView {
  OVERVIEW = 1,
  FILLS = 2,
  SWAP = 3,
  BRIDGE = 4,
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

const tabItems = (
  chainId: SupportedChainId,
  _order: Order | null,
  trades: Trade[],
  areTradesLoading: boolean,
  isOrderLoading: boolean,
  onChangeTab: (tab: TabView) => void,
  isPriceInverted: boolean,
  invertPrice: Command,
): TabItemInterface[] => {
  const order = getOrderWithTxHash(_order, trades)
  const areTokensLoaded = order?.buyToken && order?.sellToken
  const isLoadingForTheFirstTime = isOrderLoading && !areTokensLoaded
  const filledPercentage = order?.filledPercentage && formatPercentage(order.filledPercentage)
  const showFills = order?.partiallyFillable && !order.txHash && trades.length > 1

  // For swap+bridge orders, create three tabs
  if (order?.bridgeProviderId) {
    const overviewTab = {
      id: TabView.OVERVIEW,
      tab: <span>Overview</span>,
      content: (
        <>
          {order && areTokensLoaded && (
            <DetailsTable
              chainId={chainId}
              order={order}
              showFillsButton={false}
              viewFills={(): void => {}}
              areTradesLoading={areTradesLoading}
              isPriceInverted={isPriceInverted}
              invertPrice={invertPrice}
              renderMode="SUMMARY"
            />
          )}
          {!isOrderLoading && order && !areTokensLoaded && <p>Not able to load tokens</p>}
          {isLoadingForTheFirstTime && <CowLoading />}
        </>
      ),
    }

    const swapTab = {
      id: TabView.SWAP,
      tab: (
        <TabContent>
          1. Swap <StatusLabel status={order.status} />
        </TabContent>
      ),
      content: (
        <>
          {order && areTokensLoaded && (
            <DetailsTable
              chainId={chainId}
              order={order}
              showFillsButton={showFills}
              viewFills={(): void => onChangeTab(TabView.FILLS)}
              areTradesLoading={areTradesLoading}
              isPriceInverted={isPriceInverted}
              invertPrice={invertPrice}
              renderMode="FULL"
            />
          )}
          {!isOrderLoading && order && !areTokensLoaded && <p>Not able to load tokens</p>}
          {isLoadingForTheFirstTime && <CowLoading />}
        </>
      ),
    }

    const bridgeStatus = (order?.bridgeDetails as BridgeDetails | undefined)?.status || 'Unknown'

    // Note: swap+bridge orders don't support partial fills for now
    const isSwapComplete = order.status === OrderStatus.Filled || order.partiallyFilled

    // Determine effective bridge status for tab title
    const effectiveBridgeStatusForTab = (() => {
      if (!isSwapComplete && bridgeStatus === BridgeStatus.Pending) {
        return 'Waiting for swap'
      }
      return bridgeStatus
    })()

    const bridgeTab = {
      id: TabView.BRIDGE,
      tab: (
        <TabContent>
          2. Bridge{' '}
          {effectiveBridgeStatusForTab === 'Waiting for swap' ? (
            <StatusLabel status={BridgeStatus.Pending} customText="Waiting for swap" />
          ) : (
            <StatusLabel status={bridgeStatus} />
          )}
        </TabContent>
      ),
      content: (
        <BridgeDetailsTable
          bridgeDetails={order.bridgeDetails}
          ownerAddress={order.owner}
          receiverAddress={order.receiver}
          swapStatus={order.status}
          partiallyFilled={order.partiallyFilled}
        />
      ),
    }

    return [overviewTab, swapTab, bridgeTab]
  }

  // Legacy behavior for regular orders
  const detailsTab = {
    id: TabView.OVERVIEW,
    tab: <span>Overview</span>,
    content: (
      <>
        {order && areTokensLoaded && (
          <DetailsTable
            chainId={chainId}
            order={order}
            showFillsButton={showFills}
            viewFills={(): void => onChangeTab(TabView.FILLS)}
            areTradesLoading={areTradesLoading}
            isPriceInverted={isPriceInverted}
            invertPrice={invertPrice}
          />
        )}
        {order && order.bridgeDetails && (
          <BridgeDetailsWrapper>
            <BridgeDetailsTable
              bridgeDetails={order.bridgeDetails}
              ownerAddress={order.owner}
              receiverAddress={order.receiver}
              swapStatus={order.status}
              partiallyFilled={order.partiallyFilled}
            />
          </BridgeDetailsWrapper>
        )}
        {!isOrderLoading && order && !areTokensLoaded && <p>Not able to load tokens</p>}
        {isLoadingForTheFirstTime && <CowLoading />}
      </>
    ),
  }

  if (!showFills) {
    return [detailsTab]
  }

  const fillsTab = {
    id: TabView.FILLS,
    tab: filledPercentage ? <span>Fills ({filledPercentage})</span> : <span>Fills</span>,
    content: (
      <FillsTableWithData
        order={order}
        areTokensLoaded={!!areTokensLoaded}
        isPriceInverted={isPriceInverted}
        invertPrice={invertPrice}
      />
    ),
  }

  return [detailsTab, fillsTab]
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

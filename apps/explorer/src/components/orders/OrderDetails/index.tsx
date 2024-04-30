import React, { useCallback, useEffect, useState } from 'react'

import { Command } from '@cowprotocol/types'

import CowLoading from 'components/common/CowLoading'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import { TabItemInterface } from 'components/common/Tabs/Tabs'
import { ConnectionStatus } from 'components/ConnectionStatus'
import { Notification } from 'components/Notification'
import { DetailsTable } from 'components/orders/DetailsTable'
import RedirectToSearch from 'components/RedirectToSearch'
import { useQuery, useUpdateQueryString } from 'hooks/useQuery'
import styled from 'styled-components/macro'
import { media } from 'theme/styles/media'
import { Errors } from 'types'
import { formatPercentage } from 'utils'

import { Order, Trade } from 'api/operator'

import { FillsTableContext } from './context/FillsTableContext'
import { FillsTableWithData } from './FillsTableWithData'

import ExplorerTabs from '../../../explorer/components/common/ExplorerTabs/ExplorerTabs'
import TablePagination, { PaginationWrapper } from '../../../explorer/components/common/TablePagination'
import { useTable } from '../../../explorer/components/TokensTableWidget/useTable'
import { TAB_QUERY_PARAM_KEY } from '../../../explorer/const'

const TitleUid = styled(RowWithCopyButton)`
  color: ${({ theme }): string => theme.grey};
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  font-weight: ${({ theme }): string => theme.fontNormal};
  margin: 0 0 0 1rem;
  display: flex;
  align-items: center;
`

const WrapperExtraComponents = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  height: 100%;
  gap: 1rem;
  ${media.mobile} {
    ${PaginationWrapper} {
      display: none;
    }
    justify-content: center;
  }
`

const StyledExplorerTabs = styled(ExplorerTabs)`
  margin-top: 2rem;
  &.orderDetails-tab {
    &--overview {
      .tab-content {
        padding: 0;
      }
    }
  }
`

export type Props = {
  order: Order | null
  trades: Trade[]
  isOrderLoading: boolean
  areTradesLoading: boolean
  errors: Errors
}

export enum TabView {
  OVERVIEW = 1,
  FILLS,
}

const DEFAULT_TAB = TabView[1]

function useQueryViewParams(): { tab: string } {
  const query = useQuery()
  return { tab: query.get(TAB_QUERY_PARAM_KEY)?.toUpperCase() || DEFAULT_TAB } // if URL param empty will be used DEFAULT
}

const tabItems = (
  _order: Order | null,
  trades: Trade[],
  areTradesLoading: boolean,
  isOrderLoading: boolean,
  onChangeTab: (tab: TabView) => void,
  isPriceInverted: boolean,
  invertPrice: Command
): TabItemInterface[] => {
  const order = getOrderWithTxHash(_order, trades)
  const areTokensLoaded = order?.buyToken && order?.sellToken
  const isLoadingForTheFirstTime = isOrderLoading && !areTokensLoaded
  const filledPercentage = order?.filledPercentage && formatPercentage(order.filledPercentage)
  const showFills = order?.partiallyFillable && !order.txHash && trades.length > 1

  const detailsTab = {
    id: TabView.OVERVIEW,
    tab: <span>Overview</span>,
    content: (
      <>
        {order && areTokensLoaded && (
          <DetailsTable
            order={order}
            showFillsButton={showFills}
            viewFills={(): void => onChangeTab(TabView.FILLS)}
            areTradesLoading={areTradesLoading}
            isPriceInverted={isPriceInverted}
            invertPrice={invertPrice}
          />
        )}
        {!isOrderLoading && order && !areTokensLoaded && <p>Not able to load tokens</p>}
        {isLoadingForTheFirstTime && (
          <EmptyItemWrapper>
            <CowLoading />
          </EmptyItemWrapper>
        )}
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
    return { ...order, txHash: trades[0].txHash || undefined }
  }
  return order
}

const RESULTS_PER_PAGE = 10

export const OrderDetails: React.FC<Props> = (props) => {
  const { order, isOrderLoading, areTradesLoading, errors, trades } = props
  const { tab } = useQueryViewParams()
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

  if (redirectTo) {
    return <RedirectToSearch from="orders" />
  }

  return (
    <>
      <h1>
        {order && 'Order details'}
        {order && <TitleUid textToCopy={order.uid} contentsToDisplay={order.shortId} />}
      </h1>
      <ConnectionStatus />
      {Object.keys(errors).map((key) => (
        <Notification key={key} type={errors[key].type} message={errors[key].message} />
      ))}
      <FillsTableContext.Provider
        value={{
          trades,
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
            order,
            trades,
            areTradesLoading,
            isOrderLoading,
            onChangeTab,
            isPriceInverted,
            invertPrice
          )}
          selectedTab={tabViewSelected}
          updateSelectedTab={(key: number): void => onChangeTab(key)}
          extra={ExtraComponentNode}
        />
      </FillsTableContext.Provider>
    </>
  )
}

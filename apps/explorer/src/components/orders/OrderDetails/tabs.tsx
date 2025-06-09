import React, { ReactNode } from 'react'

import { BridgeStatus, CrossChainOrder } from '@cowprotocol/cow-sdk'
import { Loader } from '@cowprotocol/ui'

import { Nullish } from 'types'

import { FillsTableWithData, FillsTableWithDataProps } from './FillsTableWithData'
import { TabContent } from './styled'

import { Order, OrderStatus } from '../../../api/operator'
import CowLoading from '../../common/CowLoading'
import { BridgeDetailsTable } from '../BridgeDetailsTable'
import { StatusLabel } from '../StatusLabel'

export enum TabView {
  OVERVIEW = 1,
  FILLS = 2,
  SWAP = 3,
  BRIDGE = 4,
}

export interface OrderTab {
  id: TabView
  tab: ReactNode
  content: ReactNode
}

export function getOverviewTab(children: ReactNode, noTokens: boolean, isLoadingForTheFirstTime: boolean): OrderTab {
  return {
    id: TabView.OVERVIEW,
    tab: <span>Overview</span>,
    content: (
      <>
        {children}
        {noTokens && <p>Not able to load tokens</p>}
        {isLoadingForTheFirstTime && <CowLoading />}
      </>
    ),
  }
}

export function getSwapTab(
  order: Order,
  children: ReactNode,
  noTokens: boolean,
  isLoadingForTheFirstTime: boolean,
): OrderTab {
  return {
    id: TabView.SWAP,
    tab: (
      <TabContent>
        1. Swap <StatusLabel status={order.status} />
      </TabContent>
    ),
    content: (
      <>
        {children}
        {noTokens && <p>Not able to load tokens</p>}
        {isLoadingForTheFirstTime && <CowLoading />}
      </>
    ),
  }
}

export function getFillsTab(filledPercentage: string | undefined, props: FillsTableWithDataProps): OrderTab {
  return {
    id: TabView.FILLS,
    tab: filledPercentage ? <span>Fills ({filledPercentage})</span> : <span>Fills</span>,
    content: <FillsTableWithData {...props} />,
  }
}

export function getBridgeTab(
  order: Order,
  crossChainOrder: Nullish<CrossChainOrder>,
  crossChainOrderLoading: boolean,
): OrderTab {
  const bridgeStatus = crossChainOrder?.statusResult.status || BridgeStatus.UNKNOWN

  // Note: swap+bridge orders don't support partial fills for now
  const isSwapComplete = order.status === OrderStatus.Filled || order.partiallyFilled

  // Determine effective bridge status for tab title
  const effectiveBridgeStatusForTab = !isSwapComplete && bridgeStatus === BridgeStatus.IN_PROGRESS

  return {
    id: TabView.BRIDGE,
    tab: (
      <TabContent>
        2. Bridge{' '}
        {effectiveBridgeStatusForTab ? (
          <StatusLabel status={BridgeStatus.IN_PROGRESS} customText="Waiting for swap" />
        ) : crossChainOrderLoading ? (
          <Loader />
        ) : (
          <StatusLabel status={bridgeStatus} />
        )}
      </TabContent>
    ),
    content: <BridgeDetailsTable crossChainOrder={crossChainOrder || undefined} isLoading={crossChainOrderLoading} />,
  }
}

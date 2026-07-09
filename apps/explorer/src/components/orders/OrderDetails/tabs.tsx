import React, { ReactNode } from 'react'

import { ZERO_ADDRESS } from '@cowprotocol/common-const'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { BridgeStatus, CrossChainOrder } from '@cowprotocol/sdk-bridging'
import { Nullish } from '@cowprotocol/types'
import { Loader } from '@cowprotocol/ui'

import { FillsTableWithData, FillsTableWithDataProps } from './FillsTableWithData'
import { TabContent } from './styled'

import { Order, OrderStatus } from '../../../api/operator'
import { LoadingWrapper } from '../../common/LoadingWrapper'
import { BridgeDetailsTable } from '../BridgeDetailsTable'
import { StatusLabel } from '../StatusLabel'

export enum TabView {
  OVERVIEW = 1,
  FILLS = 2,
  BRIDGE = 3,
}

export interface OrderTab {
  id: TabView
  tab: ReactNode
  content: ReactNode
}

const WAITING_SWAP = 'Waiting for swap'

function isBridgingFromOrToMissing(crossChainOrder: Nullish<CrossChainOrder>): boolean {
  if (!crossChainOrder) {
    return false
  }
  const { owner, recipient } = crossChainOrder.bridgingParams
  const ownerUnset = !owner?.trim() || areAddressesEqual(owner, ZERO_ADDRESS)
  const recipientUnset = !recipient?.trim() || areAddressesEqual(recipient, ZERO_ADDRESS)
  return ownerUnset || recipientUnset
}

export function getOverviewTab(
  title: ReactNode,
  children: ReactNode,
  noTokens: boolean,
  isLoadingForTheFirstTime: boolean,
): OrderTab {
  return {
    id: TabView.OVERVIEW,
    tab: title,
    content: (
      <>
        {children}
        {noTokens && <p>Not able to load tokens</p>}
        {isLoadingForTheFirstTime && <LoadingWrapper message="Loading order" />}
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
  const bridgeStatus = crossChainOrder?.statusResult.status

  // Note: swap+bridge orders don't support partial fills for now
  const isSwapComplete = order.status === OrderStatus.Filled || order.partiallyFilled

  return {
    id: TabView.BRIDGE,
    tab: (
      <TabContent>
        2. Bridge{' '}
        {!isSwapComplete ? (
          <StatusLabel status={BridgeStatus.IN_PROGRESS} customText={WAITING_SWAP} />
        ) : crossChainOrderLoading || !bridgeStatus ? (
          <Loader />
        ) : (
          <StatusLabel
            status={bridgeStatus}
            warningLabel={
              bridgeStatus === BridgeStatus.EXECUTED && isBridgingFromOrToMissing(crossChainOrder)
                ? 'Missing from or to address'
                : undefined
            }
          />
        )}
      </TabContent>
    ),
    content: (
      <BridgeDetailsTable
        crossChainOrder={crossChainOrder || undefined}
        isLoading={crossChainOrderLoading}
        message={!isSwapComplete ? WAITING_SWAP : undefined}
      />
    ),
  }
}

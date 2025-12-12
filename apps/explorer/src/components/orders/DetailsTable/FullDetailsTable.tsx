import React, { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BridgeProviderType } from '@cowprotocol/sdk-bridging'

import { Order } from 'api/operator'

import { BaseDetailsTable } from './BaseDetailsTable'

export interface FullDetailsTableProps {
  chainId: SupportedChainId
  order: Order
  showFillsButton: boolean | undefined
  areTradesLoading: boolean
  bridgeProviderType?: BridgeProviderType
  children: ReactNode
}

export function FullDetailsTable({
  chainId,
  order,
  showFillsButton,
  areTradesLoading,
  bridgeProviderType,
  children,
}: FullDetailsTableProps): ReactNode {
  const { buyToken, sellToken } = order

  if (!buyToken || !sellToken) {
    return null
  }

  return (
    <BaseDetailsTable
      chainId={chainId}
      order={order}
      showFillsButton={showFillsButton}
      areTradesLoading={areTradesLoading}
      bridgeProviderType={bridgeProviderType}
    >
      {children}
    </BaseDetailsTable>
  )
}

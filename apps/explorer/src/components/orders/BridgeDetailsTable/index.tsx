import React, { ReactNode } from 'react'

import { CrossChainOrder } from '@cowprotocol/cow-sdk'

import { DetailRow } from 'components/common/DetailRow'
import { LoadingWrapper } from 'components/common/LoadingWrapper'
import { SimpleTable } from 'components/common/SimpleTable'

import { BridgeDetailsContent } from './BridgeDetailsContent'
import { BridgeDetailsTooltips } from './bridgeDetailsTooltips'
import { BridgeTxOverview } from './BridgeTxOverview'
import { Wrapper } from './styled'

interface BridgeDetailsTableProps {
  crossChainOrder: CrossChainOrder | undefined
  isLoading?: boolean
}

export function BridgeDetailsTable({ crossChainOrder, isLoading = false }: BridgeDetailsTableProps): ReactNode {
  return (
    <Wrapper>
      <SimpleTable
        columnViewMobile
        body={
          <>
            {!isLoading && crossChainOrder && (
              <DetailRow
                label="Transaction Details"
                tooltipText={BridgeDetailsTooltips.transactionHash}
                isLoading={isLoading}
              >
                <BridgeTxOverview crossChainOrder={crossChainOrder} />
              </DetailRow>
            )}
            {isLoading || !crossChainOrder ? (
              <LoadingWrapper message="Loading bridging data" />
            ) : (
              <BridgeDetailsContent crossChainOrder={crossChainOrder} />
            )}
          </>
        }
      />
    </Wrapper>
  )
}

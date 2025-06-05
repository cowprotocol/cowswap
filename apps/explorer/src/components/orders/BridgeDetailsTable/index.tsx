import React, { ReactNode } from 'react'

import { CrossChainOrder } from '@cowprotocol/cow-sdk'
import { Loader } from '@cowprotocol/ui'

import { DetailRow } from 'components/common/DetailRow'
import { SimpleTable } from 'components/common/SimpleTable'
import { SWRResponse } from 'swr'

import { BridgeDetailsContent } from './BridgeDetailsContent'
import { BridgeDetailsTooltips } from './bridgeDetailsTooltips'
import { BridgeTxOverview } from './BridgeTxOverview'
import { Wrapper } from './styled'

interface BridgeDetailsTableProps {
  crossChainOrderResponse: SWRResponse<CrossChainOrder | null | undefined>
}

export function BridgeDetailsTable({ crossChainOrderResponse }: BridgeDetailsTableProps): ReactNode {
  const { isLoading: isOverallLoading, data: crossChainOrder } = crossChainOrderResponse

  return (
    <Wrapper>
      <SimpleTable
        columnViewMobile
        body={
          <>
            <DetailRow
              label="Transaction Details"
              tooltipText={BridgeDetailsTooltips.transactionHash}
              isLoading={isOverallLoading}
            >
              {crossChainOrder && <BridgeTxOverview crossChainOrder={crossChainOrder} />}
            </DetailRow>
            {isOverallLoading || !crossChainOrder ? (
              <Loader />
            ) : (
              <BridgeDetailsContent crossChainOrder={crossChainOrder} />
            )}
          </>
        }
      />
    </Wrapper>
  )
}

import React, { ReactNode } from 'react'

import { CrossChainOrder } from '@cowprotocol/cow-sdk'
import { Loader } from '@cowprotocol/ui'

import { DetailRow } from 'components/common/DetailRow'
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
            <DetailRow
              label="Transaction Details"
              tooltipText={BridgeDetailsTooltips.transactionHash}
              isLoading={isLoading}
            >
              {crossChainOrder && <BridgeTxOverview crossChainOrder={crossChainOrder} />}
            </DetailRow>
            {isLoading || !crossChainOrder ? <Loader /> : <BridgeDetailsContent crossChainOrder={crossChainOrder} />}
          </>
        }
      />
    </Wrapper>
  )
}

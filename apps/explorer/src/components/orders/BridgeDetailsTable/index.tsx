import React, { ReactNode } from 'react'

import { CrossChainOrder } from '@cowprotocol/cow-sdk'

import { DetailRow } from 'components/common/DetailRow'
import CowLoading from 'components/common/CowLoading'
import { SimpleTable } from 'components/common/SimpleTable'
import styled from 'styled-components/macro'

import { BridgeDetailsContent } from './BridgeDetailsContent'
import { BridgeDetailsTooltips } from './bridgeDetailsTooltips'
import { BridgeTxOverview } from './BridgeTxOverview'
import { Wrapper } from './styled'

export const LoadingWrapper = styled.div`
  text-align: center;
  margin: 50px 0;
  
  h3 {
    font-size: var(--font-size-larger);
    font-weight: var(--font-weight-normal);
  }
`

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
              <LoadingWrapper>
                <CowLoading />
                <h3>Bridging data loading</h3>
              </LoadingWrapper>
            ) : (
              <BridgeDetailsContent crossChainOrder={crossChainOrder} />
            )}
          </>
        }
      />
    </Wrapper>
  )
}

import { ReactNode } from 'react'

import styled from 'styled-components/macro'

import { ColumnOneCard, ColumnThreeCard, ColumnTwoCard, ThreeColumnGrid } from '../shared'

const SkeletonSpacer = styled.div<{ $height: number }>`
  width: 100%;
  min-height: ${({ $height }) => `${$height}px`};
`

export function AffiliateTraderLoading(): ReactNode {
  return (
    <ThreeColumnGrid>
      <ColumnOneCard showLoader>
        <SkeletonSpacer $height={260} />
      </ColumnOneCard>
      <ColumnTwoCard showLoader>
        <SkeletonSpacer $height={260} />
      </ColumnTwoCard>
      <ColumnThreeCard showLoader>
        <SkeletonSpacer $height={220} />
      </ColumnThreeCard>
    </ThreeColumnGrid>
  )
}

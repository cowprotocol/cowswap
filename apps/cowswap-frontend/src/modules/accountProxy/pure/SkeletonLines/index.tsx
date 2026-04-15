import { ReactNode } from 'react'

import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

interface SkeletonLinesProps {
  skeletonHeight?: number
}

const SkeletonContainer = styled.div<{ $skeletonHeight: number }>`
  width: 65px;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ $skeletonHeight }) => $skeletonHeight}px;
  padding: 12px 0;
`

const SkeletonLine = styled.div<{ $width: string; $skeletonHeight: number }>`
  height: ${({ $skeletonHeight }) => $skeletonHeight}px;
  width: ${({ $width }) => $width};
  background: var(${UI.COLOR_TEXT_OPACITY_10});
`

export function SkeletonLines({ skeletonHeight = 6 }: SkeletonLinesProps): ReactNode {
  return (
    <SkeletonContainer $skeletonHeight={skeletonHeight}>
      <SkeletonLine $width="65%" $skeletonHeight={skeletonHeight} />
      <SkeletonLine $width="85%" $skeletonHeight={skeletonHeight} />
      <SkeletonLine $width="45%" $skeletonHeight={skeletonHeight} />
    </SkeletonContainer>
  )
}

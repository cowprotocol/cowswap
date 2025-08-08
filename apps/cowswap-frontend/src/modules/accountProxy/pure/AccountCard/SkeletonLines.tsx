import { ReactNode } from 'react'

import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

interface SkeletonLinesProps {
  skeletonHeight?: number
}
const SkeletonLinesStyled = styled.div<{ $skeletonHeight: number }>`
  --skeletonHeight: ${({ $skeletonHeight }) => $skeletonHeight}px;
  width: 65px;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: var(--skeletonHeight);
  padding: 12px 0;

  &::before,
  &::after,
  & > span {
    content: '';
    display: block;
    height: var(--skeletonHeight);
    background: var(${UI.COLOR_TEXT_OPACITY_10});
  }

  &::before {
    width: 65%;
  }
  &::after {
    width: 45%;
  }
  & > span {
    width: 85%;
  }
`

export function SkeletonLines({ skeletonHeight = 6 }: SkeletonLinesProps): ReactNode {
  return (
    <SkeletonLinesStyled $skeletonHeight={skeletonHeight}>
      <span />
    </SkeletonLinesStyled>
  )
}

import { ReactNode } from 'react'

import { UI } from '@cowprotocol/ui'

import styled, { keyframes } from 'styled-components/macro'

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`

const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    var(${UI.COLOR_PAPER_DARKER}) 0%,
    var(${UI.COLOR_PAPER}) 50%,
    var(${UI.COLOR_PAPER_DARKER}) 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite ease-in-out;
  border-radius: 12px;
`

const SkeletonContainer = styled.div`
  width: 100%;
  height: var(--progress-top-section-height, 246px);
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 16px;
  border-radius: 21px 21px 0 0;
  background: var(${UI.COLOR_PAPER_DARKER});
  position: relative;
  overflow: hidden;
  contain: layout style paint;
`

const SkeletonTitle = styled(SkeletonBase)`
  width: 60%;
  height: 28px;
`

const SkeletonDescription = styled(SkeletonBase)`
  width: 80%;
  height: 20px;
`

const SkeletonImage = styled(SkeletonBase)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  position: absolute;
  right: 24px;
  bottom: 24px;
`

const SkeletonProgress = styled(SkeletonBase)`
  width: 100%;
  height: 8px;
  margin-top: auto;
`

interface ProgressSkeletonProps {
  variant?: 'default' | 'minimal'
}

export function ProgressSkeleton({ variant = 'default' }: ProgressSkeletonProps): ReactNode {
  if (variant === 'minimal') {
    return (
      <SkeletonContainer>
        <SkeletonTitle />
        <SkeletonProgress />
      </SkeletonContainer>
    )
  }

  return (
    <SkeletonContainer>
      <SkeletonTitle />
      <SkeletonDescription />
      <SkeletonDescription style={{ width: '50%' }} />
      <SkeletonImage />
      <SkeletonProgress />
    </SkeletonContainer>
  )
}

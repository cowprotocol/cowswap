import styled, { keyframes } from 'styled-components/macro'

import { SummaryRow } from 'common/pure/SummaryRow'

const shimmerAnimation = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`

export const ShimmerWrapper = styled.span`
  position: relative;
  display: inline-block;
  overflow: hidden;
  background: var(--cow-color-paper-darker);
  border-radius: 4px;
  min-width: 60px;
  height: 1.2em;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, var(--cow-color-paper) 50%, transparent 100%);
    animation: ${shimmerAnimation} 1.5s infinite ease-in-out;
  }
`

export const StepContent = styled.i`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  border: 1px solid var(--cow-color-text-opacity-10);
  border-radius: 16px;
  padding: 10px;
  font-size: 13px;
  font-weight: var(--cow-font-weight-medium);
  font-style: normal;
  cursor: pointer;
`

export const SwapSummaryRow = styled(SummaryRow)`
  margin: 8px 0 8px;
`

export const BridgeSummaryRow = styled(SummaryRow)`
  margin: 0 0 10px;
`
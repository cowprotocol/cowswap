import { Media } from '@cowprotocol/ui'

import styled, { keyframes } from 'styled-components/macro'

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

export const SummaryRow = styled.div`
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 100px 1fr;
  width: 100%;
  margin: 0 0 4px;
  color: inherit;

  ${Media.upToSmall()} {
    grid-template-columns: 1fr;
    grid-template-rows: max-content max-content;
    margin: 0 0 16px 0;
  }

  > b,
  > i {
    position: relative;
    font-size: inherit;
    margin: 0;
    color: inherit;
    display: flex;
    align-items: center;
    font-style: normal;
    font-weight: normal;
    gap: 4px;
  }

  > b {
    padding: 0;
    opacity: 0.7;
  }

  > i {
    word-break: break-word;
    white-space: break-spaces;

    ${Media.upToSmall()} {
      font-weight: 600;
      margin: 6px 0 0;
    }
  }
`

export const SwapSummaryRow = styled(SummaryRow)`
  margin: 8px 0 8px;
`

export const BridgeSummaryRow = styled(SummaryRow)`
  margin: 0 0 10px;
`

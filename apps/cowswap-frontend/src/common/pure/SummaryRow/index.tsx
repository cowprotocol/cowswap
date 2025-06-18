import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const SummaryRow = styled.div<{ isExpired?: boolean; isCancelled?: boolean }>`
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
    text-decoration: ${({ isExpired, isCancelled }) => (isExpired || isCancelled) && 'line-through'};

    ${Media.upToSmall()} {
      font-weight: 600;
      margin: 6px 0 0;
    }

    &.cancelled {
      text-decoration: line-through;
    }
  }
`
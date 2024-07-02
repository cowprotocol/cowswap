import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ClaimSummaryTitle = styled.h1`
  font-size: 1.6rem;
  margin-left: 15px;
`

export const ClaimTotal = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  justify-content: flex-start;
  align-items: flex-start;

  > b {
    font-size: 14px;
    font-weight: normal;
    margin: 0 0 2px;
    opacity: 0.7;

    ${Media.upToSmall()} {
      margin: 0 0 3px;
    }
  }

  > p {
    margin: 0;
    font-size: 30px;
    font-weight: bold;

    ${Media.upToSmall()} {
      font-size: 16px;
      line-height: 1;
    }
  }
`

export const ClaimSummary = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  padding: 8px;
  background: var(${UI.COLOR_PAPER_DARKER});
  border: 0;
  border-radius: var(--border-radius);
  margin: 0 auto 24px;
  position: relative;
  overflow: hidden;

  h1,
  div {
    z-index: 1;
  }

  p {
    margin: 0;
    display: block;
  }

  > div {
    margin: 0 0 0 18px;
  }
`

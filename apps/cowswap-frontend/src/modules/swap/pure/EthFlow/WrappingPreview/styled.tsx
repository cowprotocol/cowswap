import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const WrapCardWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  padding: 16px;

  > div {
    margin: 0 0 14px;
    box-shadow: none;
  }
`

export const BalanceLabel = styled.p<{ background?: string }>`
  display: flex;
  justify-content: center;
  margin: 0 0 6px;
  font-size: 15px;
  width: 100%;
  padding: 0 10px;
  flex-wrap: wrap;
  gap: 0;

  > span {
    display: inline;
  }
`

export const WrappingPreviewContainer = styled.div`
  position: relative;
  ${({ theme }) => theme.flexRowNoWrap}
  margin: 12px 0;
  width: 100%;
  min-height: 140px;
  overflow: hidden;

  > ${WrapCardWrapper} {
    border: 1px solid var(${UI.COLOR_PAPER_DARKER});

    &:nth-of-type(1) {
      background-color: var(${UI.COLOR_PAPER});
      border-radius: 16px 0 0 16px;
      border-right: 0;
    }

    &:nth-of-type(2) {
      color: inherit;
      background-color: var(${UI.COLOR_PAPER_DARKER});
      border: 1px solid var(${UI.COLOR_PAPER_DARKER});
      border-radius: 0 16px 16px 0;
    }

    > ${BalanceLabel}:last-of-type {
      margin: 0;
      font-size: 13px;
      opacity: 0.8;
      display: inline-block;
      word-break: break-word;
    }
  }

  // arrow
  > svg {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    margin: auto;
    background: var(${UI.COLOR_PAPER_DARKER});
    stroke: var(${UI.COLOR_TEXT});
    width: 32px;
    height: 32px;
    border-radius: 32px;
    padding: 5px;
  }
`

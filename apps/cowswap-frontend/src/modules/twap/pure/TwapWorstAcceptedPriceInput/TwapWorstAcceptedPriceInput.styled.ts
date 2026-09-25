import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 16px;
`

export const Inputs = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 10px;
`

export const ExecutionPriceWrapper = styled.div`
  flex: 1 1 auto;
  height: 56px;
  border-radius: 12px;
  padding: 6px 12px;
  background-color: var(${UI.COLOR_PAPER_DARKER});
`

export const SlippageInput = styled.div`
  display: flex;
  flex: 0 0 100px;
  width: 100px;

  > div {
    width: 100%;
    height: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding-inline: 8px;
    align-items: center;
  }

  > div > span:first-child:empty {
    display: none;
  }

  > div > div,
  > div > div > span {
    flex: 1 1 auto;
    min-width: 0;
    width: 100%;
  }

  && input {
    width: auto;
    min-width: 0;
    max-width: none;
    flex: 1 1 auto;
  }
`

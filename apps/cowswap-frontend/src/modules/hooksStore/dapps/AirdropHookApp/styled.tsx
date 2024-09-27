import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ContentWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: space-between;
  padding: 24px 0;
  align-items: center;
  text-align: center;
  flex: 1 1 auto;
`

export const Input = styled.input`
  border: 1px solid var(${UI.COLOR_BORDER});
  background: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  width: 100%;
  margin: 10px 0;
  margin-top: 0;
  padding: 10px;
  border-radius: 12px;
  outline: none;
  font-size: 15px;
  font-weight: bold;

  &:focus {
    border: 1px solid var(${UI.COLOR_PRIMARY});
  }
`

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  padding: 10px;
  flex-grow: 1;
`
export const Label = styled.span`
  color: var(${UI.COLOR_TEXT2});
  margin: 0 0 10px;
  display: inline-block;
`

export const Amount = styled.div`
  font-weight: bold;
  font-size: 36px;
`

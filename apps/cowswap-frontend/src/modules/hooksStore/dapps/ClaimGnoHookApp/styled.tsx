import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  padding-bottom: 10px;
  width: 100%;

  flex-grow: 1;
`

export const Label = styled.span`
  color: var(${UI.COLOR_TEXT2});
  margin: 0 0 10px;
  display: inline-block;
`

export const ContentWrapper = styled.div`
display: flex;
  flex-flow: column wrap;
  justify-content: space-between;
  padding: 24px 0 0;
  align-items: center;
  text-align: center;
  flex: 1 1 auto;
`

export const Amount = styled.div`
  font-weight: bold;
  font-size: 36px;

`

export const ErrorLabel = styled.div`
  color: var(${UI.COLOR_RED});
`

export const LoadingLabel = styled.div`
  color: var(${UI.COLOR_TEXT2});
`

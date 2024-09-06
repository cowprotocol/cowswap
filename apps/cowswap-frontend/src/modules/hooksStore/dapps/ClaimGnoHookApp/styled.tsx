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
`

export const ContentWrapper = styled.div`
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 1em;
  text-align: center;
`

export const Amount = styled.div`
  font-weight: 600;
  margin-top: 0.3em;
`

export const ErrorLabel = styled.div`
  color: var(${UI.COLOR_RED});
`

export const LoadingLabel = styled.div`
  color: var(${UI.COLOR_TEXT2});
`

import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ExternalLinkContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover {
    text-decoration: underline;
  }
`

export const LoaderWrapper = styled.div`
  margin: 0 20px;
`

export const ErrorWrapper = styled.div`
  text-align: right;
  display: flex;
  align-items: end;
  flex-direction: column;
  gap: 5px;
`

export const ErrorText = styled.div`
  color: var(${UI.COLOR_ALERT_TEXT});
`

import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  padding: 6px;
  font-size: 13px;
  display: flex;
  align-items: flex-start;
  gap: 7px;
  flex-flow: column wrap;
`

export const RateInfoWrapper = styled.div`
  width: 100%;
  margin: 0 auto;
`

export const GreenText = styled.span`
  color: var(${UI.COLOR_GREEN});
`

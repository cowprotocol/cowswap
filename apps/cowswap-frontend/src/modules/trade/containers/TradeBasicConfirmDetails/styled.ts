import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { RateInfo } from 'common/pure/RateInfo'

export const Wrapper = styled.div`
  padding: 6px;
  font-size: 13px;
  display: flex;
  align-items: flex-start;
  gap: 7px;
  flex-flow: column wrap;
`

export const StyledRateInfo = styled(RateInfo)`
  margin: 0 auto;
  font-size: 13px;
`

export const GreenText = styled.span`
  color: var(${UI.COLOR_GREEN});
`

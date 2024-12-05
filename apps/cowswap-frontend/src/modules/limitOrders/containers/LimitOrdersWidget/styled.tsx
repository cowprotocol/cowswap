import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TradeButtonBox = styled.div`
  margin: 10px 0 0;
  display: flex;
  gap: 10px;
  flex-direction: column;
`

export const FooterBox = styled.div`
  display: flex;
  flex-flow: column wrap;
  max-width: 100%;
  margin: 0 4px;
  padding: 0;
`

export const RateWrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 100%;
  gap: 6px;
  text-align: right;
  color: inherit;

  ${Media.upToSmall()} {
    display: flex;
    flex-flow: column wrap;
  }
`

import { Media, UI } from '@cowprotocol/ui'

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
  padding: 0 6px;
  gap: 7px;
`

export const RateWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  max-width: 100%;
  gap: 6px;
  text-align: right;
  color: inherit;
  background: var(${UI.COLOR_PAPER_DARKER});
  border-radius: 16px;

  ${Media.upToSmall()} {
    display: flex;
    flex-flow: column wrap;
  }
`

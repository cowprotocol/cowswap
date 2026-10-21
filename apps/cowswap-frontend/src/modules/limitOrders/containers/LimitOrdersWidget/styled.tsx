import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TradeButtonBox = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
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

import { FiatAmount, Media, QuestionTooltipIconWrapper, TokenAmount } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { TradeWidgetFieldBox, TradeWidgetFieldLabel } from 'modules/trade/pure/TradeWidgetField/styled'

export const Wrapper = styled.div`
  display: flex;
  grid-gap: 8px;

  ${Media.upToSmall()} {
    flex-direction: column;
    grid-gap: 6px;
  }
`

export const Part = styled(TradeWidgetFieldBox)`
  background-color: transparent;
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
  align-content: flex-start;
`

export const Label = styled(TradeWidgetFieldLabel)`
  ${QuestionTooltipIconWrapper} {
    opacity: 0.5;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

    &:hover {
      opacity: 1;
    }
  }
`

export const Amount = styled(TokenAmount)`
  display: flex;
  flex-flow: row wrap;
  font-size: 18px;
  font-weight: 500;
  padding: 2px 0;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  gap: 5px;

  > div:first-child {
    margin: 0 5px 0 0;
  }

  ${Media.upToSmall()} {
    font-size: 18px;
    padding: 5px 0;
  }
`

export const Fiat = styled(FiatAmount)`
  color: inherit;
  font-size: 13px;
  opacity: 0.7;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`

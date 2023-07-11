import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import { QuestionWrapper } from 'legacy/components/QuestionHelper'

import { TradeWidgetFieldBox, TradeWidgetFieldLabel } from 'modules/trade/pure/TradeWidgetField/styled'

import { FiatAmount } from 'common/pure/FiatAmount'
import { TokenAmount } from 'common/pure/TokenAmount'

export const Wrapper = styled.div`
  display: flex;
  grid-gap: 8px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    grid-gap: 6px;
  `}
`

export const Part = styled(TradeWidgetFieldBox)`
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.grey1};
  align-content: flex-start;
`

export const Label = styled(TradeWidgetFieldLabel)`
  ${QuestionWrapper} {
    opacity: 0.5;
    transition: opacity 0.2s ease-in-out;

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
    margin-right: 5px;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 18px;
    padding: 5px 0;
  `}
`

export const Fiat = styled(FiatAmount)`
  color: ${({ theme }) => transparentize(0.3, theme.text1)};
  font-size: 13px;
`

import { Media, QuestionTooltipIconWrapper, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { ExecutionPrice } from 'common/pure/ExecutionPrice'
import { RateInfo, RateWrapper } from 'common/pure/RateInfo'

export const Row = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;

  ${Media.upToSmall()} {
    flex-direction: column;
    grid-gap: 6px;
  }

  ${QuestionTooltipIconWrapper} {
    opacity: 0.5;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

    &:hover {
      opacity: 1;
    }
  }
`

export const StyledRateInfo = styled(RateInfo).attrs({ rightAlign: true })`
  padding: 10px;
  gap: 4px;
  font-size: 13px;
  display: grid;
  grid-template-columns: max-content auto;
  grid-template-rows: max-content;

  ${RateWrapper} {
    text-align: right;
  }
`

export const ExecutionPriceStyled = styled(ExecutionPrice)`
  font-size: 16px;
`

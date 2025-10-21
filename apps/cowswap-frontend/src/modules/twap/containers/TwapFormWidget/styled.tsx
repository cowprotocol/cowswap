import { Media, QuestionTooltipIconWrapper, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { ExecutionPrice } from 'common/pure/ExecutionPrice'
import { RateWrapper } from 'common/pure/RateInfo'

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

export const FooterBox = styled.div`
  width: 100%;
  padding: 0 6px;
  gap: 4px;
  display: flex;
  flex-flow: column wrap;

  ${RateWrapper} {
    text-align: right;
  }
`

export const ExecutionPriceStyled = styled(ExecutionPrice)`
  font-size: 16px;
`

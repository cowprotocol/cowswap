import { Media, QuestionTooltipIconWrapper, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

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

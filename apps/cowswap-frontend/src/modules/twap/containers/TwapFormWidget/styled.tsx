import { QuestionTooltipIconWrapper, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { TWAP_FIELD_ROW_CLASS } from '../twapFieldRowStack.constants'

export const Row = styled.div.attrs({ className: TWAP_FIELD_ROW_CLASS })`
  display: flex;
  gap: 10px;
  width: 100%;

  ${QuestionTooltipIconWrapper} {
    opacity: 0.5;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

    &:hover {
      opacity: 1;
    }
  }
`

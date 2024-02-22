import { UI } from '@cowprotocol/ui'
import { RowBetween, RowFixed } from '@cowprotocol/ui'
import { MouseoverTooltipContent } from '@cowprotocol/ui'

import { Text } from 'rebass'
import styled from 'styled-components/macro'

import { RowStyleProps } from './types'

const StyledMouseoverTooltipContent = styled(MouseoverTooltipContent)``

export const TextWrapper = styled(Text)``

export const StyledRowBetween = styled(RowBetween)<RowStyleProps>`
  flex-flow: row wrap;
  min-height: 24px;
  gap: 3px;
  color: inherit;

  ${RowFixed} {
    gap: 4px;
    min-width: 150px;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      min-width: max-content;
    `}
  }

  ${TextWrapper} {
    color: inherit;
    font-size: ${({ fontSize = 13 }) => fontSize}px;
    font-weight: ${({ fontWeight = 500 }) => fontWeight};
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

    &:first-child {
      opacity: 0.7;
      font-weight: 400;

      &:hover {
        opacity: 1;
      }
    }

    &:last-child {
      text-align: right;
    }

    &:last-child {
      text-align: right;
    }
  }

  ${StyledMouseoverTooltipContent} {
    background-color: ${({ theme }) => theme.bg3};
    color: inherit;
  }
`

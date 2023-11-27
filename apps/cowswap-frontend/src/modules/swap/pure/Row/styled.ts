import { RowBetween, RowFixed } from '@cowprotocol/ui'
import { MouseoverTooltipContent } from '@cowprotocol/ui'

import { Text } from 'rebass'
import styled from 'styled-components/macro'

import { UI } from '@cowprotocol/ui'

import { RowStyleProps } from './types'

const StyledMouseoverTooltipContent = styled(MouseoverTooltipContent)``

export const TextWrapper = styled(Text)``

export const StyledRowBetween = styled(RowBetween)<RowStyleProps>`
  min-height: 24px;
  gap: 3px;

  ${RowFixed} {
    gap: 3px;
    min-width: 200px;
  }

  ${TextWrapper} {
    color: ${`var(${UI.COLOR_TEXT})`};
    font-size: ${({ fontSize = 13 }) => fontSize}px;
    font-weight: ${({ fontWeight = 500 }) => fontWeight};

    &:first-child {
      color: ${`var(${UI.COLOR_TEXT_OPACITY_70})`};
      font-weight: 400;

      &:hover {
        color: ${`var(${UI.COLOR_TEXT})`};
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
    color: ${`var(${UI.COLOR_TEXT})`};
  }
`

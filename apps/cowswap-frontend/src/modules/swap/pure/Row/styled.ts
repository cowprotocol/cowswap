import { RowBetween, RowFixed } from '@cowprotocol/ui'
import { MouseoverTooltipContent } from '@cowprotocol/ui'

import { transparentize } from 'polished'
import { Text } from 'rebass'
import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

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
    color: var(${UI.COLOR_TEXT1});
    font-size: ${({ fontSize = 13 }) => fontSize}px;
    font-weight: ${({ fontWeight = 500 }) => fontWeight};

    &:first-child {
      color: ${({ theme }) => transparentize(0.2, theme.text1)};
      font-weight: 400;

      &:hover {
        color: var(${UI.COLOR_TEXT1});
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
    color: var(${UI.COLOR_TEXT1});
  }
`

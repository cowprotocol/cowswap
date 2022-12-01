import { Text } from 'rebass'
import styled from 'styled-components/macro'
import { RowBetween } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { RowStyleProps } from './types'
import { transparentize } from 'polished'

const StyledMouseoverTooltipContent = styled(MouseoverTooltipContent)``

export const TextWrapper = styled(Text)``

export const StyledRowBetween = styled(RowBetween)<RowStyleProps>`
  height: ${({ rowHeight = 24 }) => rowHeight}px;

  ${TextWrapper} {
    color: ${({ theme }) => theme.text1};
    font-size: ${({ fontSize = 13 }) => fontSize}px;
    font-weight: ${({ fontWeight = 500 }) => fontWeight};

    &:first-child {
      color: ${({ theme }) => transparentize(0.2, theme.text1)};
      font-weight: 400;

      &:hover {
        color: ${({ theme }) => theme.text1};
      }
    }
  }

  ${StyledMouseoverTooltipContent} {
    background-color: ${({ theme }) => theme.bg3};
    color: ${({ theme }) => theme.text1};
  }
`

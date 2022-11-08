import { Text } from 'rebass'
import styled from 'styled-components/macro'
import { RowBetween } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { RowStyleProps } from './typings'

const StyledMouseoverTooltipContent = styled(MouseoverTooltipContent)``
export const TextWrapper = styled(Text)``
export const StyledRowBetween = styled(RowBetween)<RowStyleProps>`
  height: ${({ rowHeight = 24 }) => rowHeight}px;

  ${TextWrapper} {
    color: ${({ theme }) => theme.text1};
    font-size: ${({ fontSize = 13 }) => fontSize}px;
    font-weight: ${({ fontWeight = 500 }) => fontWeight};
  }

  ${StyledMouseoverTooltipContent} {
    background-color: ${({ theme }) => theme.bg3};
    color: ${({ theme }) => theme.text1};
  }
`
export const ClickableText = styled.button<{ isWarn?: boolean }>`
  background: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  font-weight: 500;
  font-size: 13px;
  color: ${({ isWarn, theme }) => theme[isWarn ? 'text2' : 'text1']};
  cursor: pointer;
`

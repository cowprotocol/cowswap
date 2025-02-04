import { UI } from '@cowprotocol/ui'
import { RowBetween } from '@cowprotocol/ui'
import { HoverTooltip } from '@cowprotocol/ui'

import { Info } from 'react-feather'
import { Text } from 'rebass'
import styled from 'styled-components/macro'

export interface RowStyleProps {
  fontWeight?: number
  fontSize?: number
  alignContentRight?: boolean
}

const StyledHoverTooltip = styled(HoverTooltip)``
export const TextWrapper = styled(Text)<{ success?: boolean }>`
  ${({ success }) => (success ? `color: var(${UI.COLOR_GREEN}) !important;` : 'color: inherit;')}
`

export const StyledRowBetween = styled(RowBetween)<RowStyleProps>`
  flex-flow: row nowrap;
  gap: 16px;
  color: inherit;

  // if prop alignContentRight is true, then set justify-content to flex-end
  justify-content: ${({ alignContentRight }) => (alignContentRight ? 'flex-end' : 'space-between')};

  ${TextWrapper} {
    font-size: ${({ fontSize = 13 }) => fontSize}px;
    font-weight: ${({ fontWeight = 500 }) => fontWeight};
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

    &:first-child {
      opacity: 1;
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

  ${StyledHoverTooltip} {
    background-color: ${({ theme }) => theme.background};
    color: inherit;
  }
`

export const StyledInfoIcon = styled(Info)`
  color: inherit;
  opacity: 0.6;
  line-height: 0;
  vertical-align: middle;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`

export const TransactionText = styled.span`
  display: flex;
  gap: 3px;
  cursor: pointer;

  > i {
    font-style: normal;
  }
`

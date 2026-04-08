import { ReactElement, ReactNode } from 'react'

import QuestionImage from '@cowprotocol/assets/svg/question.svg'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { HoverTooltip, HoverTooltipProps, renderTooltip } from '../Tooltip'

const DefaultQuestionIcon = <SVG src={QuestionImage} />

export const QuestionTooltipIconWrapper = styled.div<{ $size?: number; $dimmed?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: ${({ $size }) => `${$size ?? 16}px`};
  min-width: ${({ $size }) => `${$size ?? 16}px`};
  height: ${({ $size }) => `${$size ?? 16}px`};
  flex-shrink: 0;
  border: none;
  outline: none;
  cursor: default;
  border-radius: 16px;
  background-color: transparent;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  color: inherit;
  opacity: ${({ $dimmed }) => ($dimmed ? 0.5 : 1)};

  &:hover {
    opacity: 1;
  }

  > svg {
    color: inherit;
    width: 100%;
    height: 100%;
  }

  > svg > path {
    stroke: currentColor;
  }
`

const HelpTooltipContainer = styled.span<{ $noMargin?: boolean }>`
  margin-left: ${({ $noMargin }) => ($noMargin ? 0 : '4px')};
  display: flex;
  align-items: baseline;
  color: inherit;
  pointer-events: auto;
`

export interface HelpTooltipProps extends Omit<HoverTooltipProps, 'QuestionMark' | 'children' | 'content'> {
  text: ReactNode
  Icon?: ReactElement
  /** Icon size in px (default 16) */
  size?: number
  /** Start at 50% opacity, full on hover (default false) */
  dimmed?: boolean
  /** Remove the default 4px left margin (default false) */
  noMargin?: boolean
}

export function HelpTooltip({ text, Icon, className, size, dimmed, noMargin, ...props }: HelpTooltipProps): ReactNode {
  const tooltip = renderTooltip(text, props)
  const content = <div>{tooltip}</div>

  return (
    <HelpTooltipContainer className={className} $noMargin={noMargin}>
      <HoverTooltip {...props} content={content} wrapInContainer>
        <QuestionTooltipIconWrapper $size={size} $dimmed={dimmed}>
          {Icon || DefaultQuestionIcon}
        </QuestionTooltipIconWrapper>
      </HoverTooltip>
    </HelpTooltipContainer>
  )
}

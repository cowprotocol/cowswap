import { ReactElement, ReactNode } from 'react'

import QuestionImage from '@cowprotocol/assets/svg/question.svg'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { HoverTooltip, HoverTooltipProps, renderTooltip } from '../Tooltip'

const DefaultQuestionIcon = <SVG src={QuestionImage} />

export const QuestionTooltipIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 16px;
  height: 16px;
  border: none;
  outline: none;
  cursor: default;
  border-radius: 16px;
  background-color: transparent;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  color: inherit;

  > svg {
    color: inherit;
  }

  > svg > path {
    stroke: currentColor;
  }
`

const HelpTooltipContainer = styled.span`
  margin-left: 4px;
  display: flex;
  align-items: center;
  color: inherit;
  pointer-events: auto;
`

export interface HelpTooltipProps extends Omit<HoverTooltipProps, 'QuestionMark' | 'children' | 'content'> {
  text: ReactNode
  Icon?: ReactElement
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HelpTooltip({ text, Icon, className, ...props }: HelpTooltipProps) {
  const tooltip = renderTooltip(text, props)
  const content = <div>{tooltip}</div>

  return (
    <HelpTooltipContainer className={className}>
      <HoverTooltip {...props} content={content} wrapInContainer>
        <QuestionTooltipIconWrapper>{Icon || DefaultQuestionIcon}</QuestionTooltipIconWrapper>
      </HoverTooltip>
    </HelpTooltipContainer>
  )
}

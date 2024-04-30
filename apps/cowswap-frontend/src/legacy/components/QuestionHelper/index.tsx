import { ReactNode } from 'react'

import QuestionImage from '@cowprotocol/assets/svg/question.svg'
import { Tooltip, TooltipProps, UI } from '@cowprotocol/ui'
import { renderTooltip } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

const DefaultQuestionMark = <SVG src={QuestionImage} />

export const QuestionWrapper = styled.div`
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

const QuestionHelperContainer = styled.span`
  margin-left: 4px;
  display: flex;
  align-items: center;
  color: inherit;
`


interface QuestionTooltipProps extends Omit<TooltipProps, 'QuestionMark'| 'children' | 'content'> {
  text: ReactNode
  Icon?: JSX.Element
}

export default function QuestionTooltip({ text, Icon, className, ...props }: QuestionTooltipProps) {
  const tooltip = renderTooltip(text, props)

  const content = (
    <div>
      {tooltip}
    </div>
  )

  const QuestionMark = () => Icon || DefaultQuestionMark

  return (
    <QuestionHelperContainer className={className}>
      <Tooltip {...props} content={content} wrapInContainer>
        <QuestionWrapper>
          <QuestionMark />
        </QuestionWrapper>
      </Tooltip>
    </QuestionHelperContainer>
  )
}


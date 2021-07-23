import React, { /* ReactNode, */ useCallback, useState } from 'react'
import styled from 'styled-components/macro'
import Tooltip from 'components/Tooltip'
import { TooltipProps } from '../Tooltip/TooltipMod'
import { QuestionWrapper } from './index'

/* const QuestionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px;
  width: 18px;
  height: 18px;
  border: none;
  background: none;
  outline: none;
  cursor: default;
  border-radius: 36px;
  font-size: 12px;
  background-color: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text2};

  :hover,
  :focus {
    opacity: 0.7;
  }
` */

/* const QuestionMark = styled.span`
  font-size: 14px;
` */

const QuestionHelperContainer = styled.span`
  margin-left: 4px;
  display: flex;
  align-items: center;
`

export interface QuestionHelperProps extends Omit<TooltipProps, 'children' | 'show'> {
  className?: string
  QuestionMark: () => JSX.Element // mod
}

// export default function QuestionHelper({ text }: { text: ReactNode; size?: number }) {
export default function QuestionHelper({ text, className, QuestionMark, ...tooltipProps }: QuestionHelperProps) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <QuestionHelperContainer className={className}>
      <Tooltip {...tooltipProps} show={show} text={text}>
        <QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
          {/* <QuestionMark>?</QuestionMark> */}
          <QuestionMark />
        </QuestionWrapper>
      </Tooltip>
    </QuestionHelperContainer>
  )
}

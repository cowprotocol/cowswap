import { useCallback, useState } from 'react'

import { Tooltip, TooltipProps, renderTooltip } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { QuestionWrapper } from './index'

const QuestionHelperContainer = styled.span`
  margin-left: 4px;
  display: flex;
  align-items: center;
`

export interface QuestionHelperProps extends Omit<TooltipProps, 'children' | 'show'> {
  className?: string
  QuestionMark: () => JSX.Element
}

export default function QuestionHelper({ text, className, QuestionMark, ...tooltipProps }: QuestionHelperProps) {
  const [show, setShow] = useState<boolean>(false)
  const [mouseLeaveTimeout, setMouseLeaveTimeout] = useState<NodeJS.Timeout | null>(null)

  const open = useCallback(() => {
    setShow(true)
    if (mouseLeaveTimeout) {
      clearTimeout(mouseLeaveTimeout)
    }
  }, [setShow, mouseLeaveTimeout])

  const close = useCallback(() => {
    const timeout = setTimeout(() => {
      setShow(false)
    }, 400)

    setMouseLeaveTimeout(timeout)
  }, [setShow])

  const content = (
    <div onMouseEnter={open} onMouseLeave={close}>
      {renderTooltip(text, tooltipProps)}
    </div>
  )

  return (
    <QuestionHelperContainer className={className}>
      <Tooltip {...tooltipProps} show={show} text={content}>
        <QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
          <QuestionMark />
        </QuestionWrapper>
      </Tooltip>
    </QuestionHelperContainer>
  )
}

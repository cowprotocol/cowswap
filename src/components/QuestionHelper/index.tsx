import { ReactNode, useCallback, useState } from 'react'
import styled from 'styled-components/macro'
import Tooltip from '../Tooltip'

const QuestionWrapper = styled.div`
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
`

const QuestionMark = styled.span`
  font-size: 14px;
`

export default function QuestionHelper({ text }: { text: ReactNode; size?: number }) {
  const [show, setShow] = useState<boolean>(false)

  const toggle = useCallback(() => setShow((show) => !show), [setShow])

  return (
    <span style={{ marginLeft: 4, display: 'flex', alignItems: 'center' }}>
      <Tooltip text={text} show={show}>
        <QuestionWrapper
          style={{ display: 'inline-block', lineHeight: 0, padding: '0.25rem', cursor: 'pointer' }}
          onMouseDown={toggle}
          role="button"
          tabIndex={0}
        >
          <QuestionMark>?</QuestionMark>
        </QuestionWrapper>
      </Tooltip>
    </span>
  )
}

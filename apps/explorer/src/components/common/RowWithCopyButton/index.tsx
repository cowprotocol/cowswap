import React from 'react'

import { CopyButton } from 'components/common/CopyButton'
import styled from 'styled-components/macro'

const Wrapper = styled.span`
  display: flex;
  align-items: center;
  flex-flow: row nowrap;
  gap: 0.5rem;

  & > :first-child {
    word-break: break-all;
  }
`

const Content = styled.div`
  display: inline-block;
  position: relative;
`

type Props = {
  textToCopy: string
  contentsToDisplay: string | React.ReactNode
  className?: string
  onCopy?: (value: string) => void
}

export function RowWithCopyButton(props: Props): React.ReactNode {
  const { textToCopy, contentsToDisplay, className, onCopy } = props

  // Wrap contents in a <span> if it's a raw string for proper CSS spacing
  const contentsComponent = typeof contentsToDisplay === 'string' ? <span>{contentsToDisplay}</span> : contentsToDisplay

  return (
    <Wrapper className={className}>
      <Content>{contentsComponent}</Content>
      <CopyButton text={textToCopy} onCopy={onCopy} />
    </Wrapper>
  )
}

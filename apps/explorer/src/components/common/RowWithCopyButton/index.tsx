import React from 'react'

import { CopyButton } from 'components/common/CopyButton'

import { Wrapper, Content } from './styled'

type Props = {
  textToCopy: string
  contentsToDisplay: string | React.ReactNode
  className?: string
  onCopy?: (value: string) => void
}

export function RowWithCopyButton(props: Props): React.ReactNode {
  const { textToCopy, contentsToDisplay, className, onCopy } = props

  const contentsComponent = typeof contentsToDisplay === 'string' ? <span>{contentsToDisplay}</span> : contentsToDisplay

  return (
    <Wrapper className={className}>
      <Content>{contentsComponent}</Content>
      <CopyButton text={textToCopy} onCopy={onCopy} />
    </Wrapper>
  )
}

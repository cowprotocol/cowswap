import React from 'react'

import { useCopyClipboard } from '@cowprotocol/common-hooks'

import { CopyIcon, CopyMessage, CopyWrapper } from '@/components/TokenDetails/index.styles'

export const CopyToClipboard = ({ text }: { text: string }) => {
  const [copied, copyToClipboard] = useCopyClipboard(3000)

  return (
    <CopyWrapper>
      {copied && <CopyMessage>Copied!</CopyMessage>}
      <CopyIcon
        src="/images/icons/click-to-copy.svg"
        alt="Copy contract address"
        onClick={() => copyToClipboard(text)}
      />
    </CopyWrapper>
  )
}

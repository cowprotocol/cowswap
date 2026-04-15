import { useEffect, useState } from 'react'

import { CopyIcon, CopyMessage, CopyWrapper } from '@/components/TokenDetails/index.styles'

export const CopyToClipboard = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
  }

  useEffect(() => {
    let timer = 0

    if (copied) {
      timer = window.setTimeout(() => {
        setCopied(false)
      }, 3000)
    }

    return () => {
      window.clearTimeout(timer)
    }
  }, [copied])

  return (
    <CopyWrapper>
      {copied && <CopyMessage>Copied!</CopyMessage>}
      <CopyIcon src="/images/icons/click-to-copy.svg" alt="Copy contract address" onClick={copyToClipboard} />
    </CopyWrapper>
  )
}

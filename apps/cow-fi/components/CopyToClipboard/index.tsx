import { CopyIcon, CopyMessage, CopyWrapper } from '@/components/TokenDetails/index.styles'
import { useEffect, useState } from 'react'

export const CopyToClipboard = ({ text }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
  }

  useEffect(() => {
    let timer = null

    if (copied) {
      timer = setTimeout(() => {
        setCopied(false)
      }, 3000)
    }

    return () => clearTimeout(timer)
  }, [copied])

  return (
    <CopyWrapper>
      {copied && <CopyMessage>Copied!</CopyMessage>}
      <CopyIcon src="/images/icons/click-to-copy.svg" alt="Copy contract address" onClick={copyToClipboard} />
    </CopyWrapper>
  )
}

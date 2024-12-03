import { CopyIcon, CopyMessage, CopyWrapper } from '@/components/TokenDetails/index.styles'
import { useEffect, useState } from 'react'

export const CopyToClipboard = ({ text, margin }: { text: string; margin?: string }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    if (copied) {
      timer = setTimeout(() => {
        setCopied(false)
      }, 3000)
    }

    return () => {
      timer && clearTimeout(timer)
    }
  }, [copied])

  return (
    <>
      <CopyWrapper margin={margin}>
        <CopyIcon src="/images/icons/click-to-copy.svg" alt="Copy contract address" onClick={copyToClipboard} />
      </CopyWrapper>
      {copied && <CopyMessage>Copied!</CopyMessage>}
    </>
  )
}

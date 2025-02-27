import { useEffect, useState, MouseEvent } from 'react'

import * as styledEl from './styled'

export interface CopyToClipboardProps {
  text: string
  copiedMessage?: string
  iconClassName?: string
}

export const CopyToClipboard = ({ text, copiedMessage = 'Copied!', iconClassName }: CopyToClipboardProps) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
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
    <styledEl.CopyWrapper>
      {copied ? (
        <styledEl.CopyMessage>{copiedMessage}</styledEl.CopyMessage>
      ) : (
        <styledEl.CopyIcon className={iconClassName} onClick={copyToClipboard} />
      )}
    </styledEl.CopyWrapper>
  )
}

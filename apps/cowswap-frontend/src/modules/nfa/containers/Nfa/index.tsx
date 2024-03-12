import { useEffect, useState } from 'react'

import CLOUD_ARROW from 'assets/icon/cloud-arrow.svg'
import SVG from 'react-inlinesvg'

import { NfaArrow, NfaItem, NfaPagination, NfaPaginationItem, NfaWrapper } from './styled'

import { useGetNFAMessages } from '../../hooks/useGetNFAMessages'

export function Nfa() {
  const [currentMessage, setCurrentMessage] = useState(0)
  const nfaMessages = useGetNFAMessages()

  useEffect(() => {
    if (!nfaMessages.length) return

    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % nfaMessages.length)
    }, 15000)

    return () => clearInterval(interval)
  }, [nfaMessages.length])

  if (!nfaMessages.length) return null

  return (
    <NfaWrapper>
      <NfaItem>{nfaMessages[currentMessage]}</NfaItem>
      <NfaPagination>
        {nfaMessages.map((_, index) => {
          return (
            <NfaPaginationItem
              key={index}
              active={currentMessage === index}
              onClick={() => setCurrentMessage(index)}
            ></NfaPaginationItem>
          )
        })}
      </NfaPagination>
      <NfaArrow>
        <SVG src={CLOUD_ARROW} />
      </NfaArrow>
    </NfaWrapper>
  )
}

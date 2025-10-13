import { ReactNode, useEffect, useRef, useState } from 'react'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import { Arrow, Bubble, BubbleContent, CloseButton, Cursor, JobsLink, TypingLine } from './CowSpeechBubble.styled'

interface CowSpeechBubbleProps {
  show: boolean
  onClose: () => void
}

const MESSAGE = "Mooo, we're hiring!"
const CAREERS_URL = 'https://jobs.ashbyhq.com/cow-dao?utm_source=laMjao1z57'
const TYPING_INTERVAL_MS = 140
const BUBBLE_DELAY_MS = 3000

export function CowSpeechBubble({ show, onClose }: CowSpeechBubbleProps): ReactNode {
  const [charIndex, setCharIndex] = useState(0)
  const [hasDelayElapsed, setHasDelayElapsed] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!show) {
      setHasDelayElapsed(false)
      setCharIndex(0)
      return
    }

    const delayId = setTimeout(() => {
      if (isMountedRef.current) {
        setHasDelayElapsed(true)
      }
    }, BUBBLE_DELAY_MS)

    return () => {
      clearTimeout(delayId)
      if (isMountedRef.current) {
        setHasDelayElapsed(false)
        setCharIndex(0)
      }
    }
  }, [show])

  useEffect(() => {
    if (!hasDelayElapsed || !show) {
      setCharIndex(0)
      return
    }

    let currentIndex = 0
    const intervalId = setInterval(() => {
      currentIndex = Math.min(currentIndex + 1, MESSAGE.length)
      if (isMountedRef.current) {
        setCharIndex(currentIndex)
      }

      if (currentIndex >= MESSAGE.length) {
        clearInterval(intervalId)
      }
    }, TYPING_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [hasDelayElapsed, show])

  const isTypingComplete = charIndex >= MESSAGE.length
  const displayedText = MESSAGE.slice(0, charIndex)
  const showCursor = hasDelayElapsed && show && !isTypingComplete

  if (!show || !hasDelayElapsed) {
    return null
  }

  return (
    <Bubble>
      <CloseButton type="button" aria-label="Dismiss hiring message" onClick={onClose}>
        ×
      </CloseButton>
      <BubbleContent>
        <TypingLine>
          <span>{displayedText}</span>
          <Cursor $visible={showCursor} />
        </TypingLine>
        <JobsLink
          href={CAREERS_URL}
          target="_blank"
          rel="noopener noreferrer"
          $visible={isTypingComplete}
          data-click-event={toCowSwapGtmEvent({
            category: CowSwapAnalyticsCategory.COWSWAP,
            action: 'Click speech bubble jobs link',
            label: CAREERS_URL,
          })}
        >
          View jobs
          <Arrow aria-hidden="true">→</Arrow>
        </JobsLink>
      </BubbleContent>
    </Bubble>
  )
}

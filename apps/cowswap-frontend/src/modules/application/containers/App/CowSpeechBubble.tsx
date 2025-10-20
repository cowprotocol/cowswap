import { useEffect, useState, type ReactNode } from 'react'

import { useReducedMotionPreference } from '@cowprotocol/common-hooks'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import { Arrow, Bubble, BubbleContent, CloseButton, Cursor, JobsLink, TypingLine } from './CowSpeechBubble.styled'
import { TYPING_MESSAGE, startTypingAnimation } from './utils/cowSpeechBubbleTyping'

export interface CowSpeechBubbleProps {
  show: boolean
  onClose: () => void
}

const CAREERS_URL = 'https://jobs.ashbyhq.com/cow-dao?utm_source=laMjao1z57'
const BUBBLE_DELAY_MS = 3000

export function CowSpeechBubble({ show, onClose }: CowSpeechBubbleProps): ReactNode {
  const prefersReducedMotion = useReducedMotionPreference()
  const hasDelayElapsed = useBubbleDelay(show)
  const charIndex = useTypingProgress({
    show,
    hasDelayElapsed,
    prefersReducedMotion,
    message: TYPING_MESSAGE,
  })

  if (!show || !hasDelayElapsed) {
    return null
  }

  const isTypingComplete = charIndex >= TYPING_MESSAGE.length
  const displayedText = TYPING_MESSAGE.slice(0, charIndex)
  const showCursor = hasDelayElapsed && show && !isTypingComplete

  return (
    <Bubble>
      <CloseButton type="button" aria-label="Dismiss hiring message" onClick={onClose}>
        ×
      </CloseButton>
      <BubbleContent>
        <TypingLine role="status" aria-live="polite" aria-atomic="true">
          <span>{displayedText}</span>
          <Cursor $visible={showCursor} />
        </TypingLine>
        <JobsLink
          href={CAREERS_URL}
          target="_blank"
          rel="noopener noreferrer"
          $visible={isTypingComplete}
          aria-label="View jobs (opens in a new tab)"
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

function useBubbleDelay(show: boolean): boolean {
  const [hasDelayElapsed, setHasDelayElapsed] = useState(false)

  useEffect(() => {
    if (!show) {
      setHasDelayElapsed(false)
      return
    }

    const delayId = setTimeout(() => {
      setHasDelayElapsed(true)
    }, BUBBLE_DELAY_MS)

    return () => clearTimeout(delayId)
  }, [show])

  return hasDelayElapsed
}

interface UseTypingProgressParams {
  show: boolean
  hasDelayElapsed: boolean
  prefersReducedMotion: boolean
  message: string
}

function useTypingProgress({ show, hasDelayElapsed, prefersReducedMotion, message }: UseTypingProgressParams): number {
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    if (!hasDelayElapsed || !show) {
      setCharIndex(prefersReducedMotion ? message.length : 0)
      return
    }

    if (prefersReducedMotion) {
      setCharIndex(message.length)
      return
    }

    return startTypingAnimation({ setCharIndex, messageLength: message.length })
  }, [hasDelayElapsed, show, prefersReducedMotion, message])

  return charIndex
}

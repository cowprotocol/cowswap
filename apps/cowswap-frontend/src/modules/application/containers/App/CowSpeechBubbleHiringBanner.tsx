import { useCallback, type ReactNode } from 'react'

import { useReducedMotionPreference } from '@cowprotocol/common-hooks'
import { ClosableBanner } from '@cowprotocol/ui'

import { msg } from '@lingui/core/macro'
import { useLingui, Trans } from '@lingui/react/macro'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { BANNER_IDS } from 'common/constants/banners'
import { useDelay } from 'common/hooks/useDelay'
import { useTypingProgress } from 'common/hooks/useTypingProgress'

import { CowSpeechBubble } from './CowSpeechBubble'
import { Arrow, Cursor, JobsLink, TypingLine } from './CowSpeechBubble.styled'

const TYPING_MESSAGE = msg`Mooo, we're hiring!`
const CAREERS_URL = 'https://jobs.ashbyhq.com/cow-dao?utm_source=laMjao1z57'
const BUBBLE_DELAY_MS = 3000

interface CowSpeechBubbleHiringContentProps {
  onClose: () => void
}

function CowSpeechBubbleHiringContent({ onClose }: CowSpeechBubbleHiringContentProps): ReactNode {
  const prefersReducedMotion = useReducedMotionPreference()
  const hasDelayElapsed = useDelay(BUBBLE_DELAY_MS)
  const { t, i18n } = useLingui()
  const typingMessage = i18n._(TYPING_MESSAGE)
  const charIndex = useTypingProgress({
    show: true,
    hasDelayElapsed,
    prefersReducedMotion,
    message: typingMessage,
  })

  const isTypingComplete = charIndex >= typingMessage.length
  const displayedText = typingMessage.slice(0, charIndex)
  const showCursor = hasDelayElapsed && !isTypingComplete

  return (
    <CowSpeechBubble show={hasDelayElapsed} onClose={onClose} closeButtonAriaLabel={t`Dismiss hiring message`}>
      <TypingLine role="status" aria-live="polite" aria-atomic="true">
        <span>{displayedText}</span>
        <Cursor $visible={showCursor} />
      </TypingLine>
      <JobsLink
        href={CAREERS_URL}
        target="_blank"
        rel="noopener noreferrer"
        $visible={isTypingComplete}
        aria-label={t`View jobs (opens in a new tab)`}
        data-click-event={toCowSwapGtmEvent({
          category: CowSwapAnalyticsCategory.COWSWAP,
          action: 'Click speech bubble jobs link',
          label: CAREERS_URL,
        })}
      >
        <Trans>View jobs</Trans>
        <Arrow aria-hidden="true">→</Arrow>
      </JobsLink>
    </CowSpeechBubble>
  )
}

export function CowSpeechBubbleHiringBanner(): ReactNode {
  const callback = useCallback((close: () => void) => <CowSpeechBubbleHiringContent onClose={close} />, [])

  return <ClosableBanner storageKey={BANNER_IDS.HIRING_SPEECH_BUBBLE} callback={callback} />
}

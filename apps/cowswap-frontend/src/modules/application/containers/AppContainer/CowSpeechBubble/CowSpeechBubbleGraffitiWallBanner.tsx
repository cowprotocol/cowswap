import { useCallback, type ReactNode } from 'react'

import { useReducedMotionPreference } from '@cowprotocol/common-hooks'
import { ClosableBanner } from '@cowprotocol/ui'

import { msg } from '@lingui/core/macro'
import { useLingui, Trans } from '@lingui/react/macro'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { BANNER_IDS } from 'common/constants/banners'
import { Routes } from 'common/constants/routes'
import { useDelay } from 'common/hooks/useDelay'
import { useTypingProgress } from 'common/hooks/useTypingProgress'

import { CowSpeechBubble } from './CowSpeechBubble'
import { Arrow, Cursor, Subtitle, TypingLine, WallLink } from './CowSpeechBubble.styled'

const TYPING_MESSAGE = msg`Mooo, check out our wall!`
const BUBBLE_DELAY_MS = 3000

interface CowSpeechBubbleGraffitiWallContentProps {
  onClose: () => void
}

export function CowSpeechBubbleGraffitiWallBanner(): ReactNode {
  const callback = useCallback((close: () => void) => <CowSpeechBubbleGraffitiWallContent onClose={close} />, [])

  return <ClosableBanner storageKey={BANNER_IDS.GRAFFITI_WALL_SPEECH_BUBBLE} callback={callback} />
}

function CowSpeechBubbleGraffitiWallContent({ onClose }: CowSpeechBubbleGraffitiWallContentProps): ReactNode {
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

  return hasDelayElapsed ? (
    <CowSpeechBubble variant="graffiti" onClose={onClose} closeButtonAriaLabel={t`Dismiss graffiti wall message`}>
      <TypingLine role="status" aria-live="polite" aria-atomic="true">
        <span>{displayedText}</span>
        <Cursor $visible={showCursor} />
      </TypingLine>
      <Subtitle $visible={isTypingComplete} aria-hidden={!isTypingComplete}>
        <Trans>Graffiti artists painted it to celebrate our Solana launch.</Trans>
      </Subtitle>
      <WallLink
        to={Routes.GRAFFITI}
        $visible={isTypingComplete}
        aria-label={t`Visit the graffiti wall`}
        onClick={onClose}
        data-click-event={toCowSwapGtmEvent({
          category: CowSwapAnalyticsCategory.COWSWAP,
          action: 'Click speech bubble graffiti wall link',
          label: Routes.GRAFFITI,
        })}
      >
        <Trans>Visit the wall</Trans>
        <Arrow aria-hidden="true">→</Arrow>
      </WallLink>
    </CowSpeechBubble>
  ) : null
}

import type { ReactNode } from 'react'

import { Bubble, BubbleContent, BubbleRow } from './CowSpeechBubble.styled'
import { CloseButton } from './CowSpeechBubbleCloseButton.styled'

import type { CowSpeechBubbleVariant } from './CowSpeechBubble.types'

export interface CowSpeechBubbleProps {
  variant: CowSpeechBubbleVariant
  onClose: () => void
  closeButtonAriaLabel: string
  children: ReactNode
}

export function CowSpeechBubble({ variant, onClose, closeButtonAriaLabel, children }: CowSpeechBubbleProps): ReactNode {
  return (
    <BubbleRow>
      <Bubble $variant={variant}>
        <CloseButton type="button" aria-label={closeButtonAriaLabel} onClick={onClose}>
          <span aria-hidden="true">×</span>
        </CloseButton>
        <BubbleContent $variant={variant}>{children}</BubbleContent>
      </Bubble>
    </BubbleRow>
  )
}

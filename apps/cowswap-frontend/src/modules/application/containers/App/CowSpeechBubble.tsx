import type { ReactNode } from 'react'

import { Bubble, BubbleContent, CloseButton } from './CowSpeechBubble.styled'

export interface CowSpeechBubbleProps {
  show: boolean
  onClose: () => void
  closeButtonAriaLabel: string
  children: ReactNode
}

export function CowSpeechBubble({ show, onClose, closeButtonAriaLabel, children }: CowSpeechBubbleProps): ReactNode {
  if (!show) {
    return null
  }

  return (
    <Bubble>
      <CloseButton type="button" aria-label={closeButtonAriaLabel} onClick={onClose}>
        ×
      </CloseButton>
      <BubbleContent>{children}</BubbleContent>
    </Bubble>
  )
}

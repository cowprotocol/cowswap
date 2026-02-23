import type { ReactNode } from 'react'

import { Bubble, BubbleContent, CloseButton } from './CowSpeechBubble.styled'

export interface CowSpeechBubbleProps {
  padding: 'small' | 'normal'
  onClose: () => void
  closeButtonAriaLabel: string
  children: ReactNode
}

export function CowSpeechBubble({ padding, onClose, closeButtonAriaLabel, children }: CowSpeechBubbleProps): ReactNode {
  return (
    <Bubble $padding={padding}>
      <CloseButton type="button" aria-label={closeButtonAriaLabel} onClick={onClose}>
        ×
      </CloseButton>
      <BubbleContent>{children}</BubbleContent>
    </Bubble>
  )
}

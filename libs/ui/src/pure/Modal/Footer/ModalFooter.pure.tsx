import { ReactNode } from 'react'

import * as styledEl from './ModalFooter.styled'

export interface ModalFooterProps {
  children: ReactNode
  className?: string
  /** Omit padding when nested inside `Modal.Content`. */
  inline?: boolean
  /** Adds a top border and padding. */
  topBorder?: boolean
}

export function ModalFooter({ children, className, inline, topBorder }: ModalFooterProps): ReactNode {
  return (
    <styledEl.Footer className={className} $inline={inline} $topBorder={topBorder}>
      {children}
    </styledEl.Footer>
  )
}

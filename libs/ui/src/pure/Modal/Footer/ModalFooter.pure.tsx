import { ReactNode } from 'react'

import * as styledEl from './ModalFooter.styled'

export interface ModalFooterProps {
  children: ReactNode
  className?: string
  /** Omit horizontal padding when nested inside `Modal.Content`. */
  inline?: boolean
}

export function ModalFooter({ children, className, inline }: ModalFooterProps): ReactNode {
  return (
    <styledEl.Footer className={className} $inline={inline}>
      {children}
    </styledEl.Footer>
  )
}

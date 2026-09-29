import { ReactNode } from 'react'

import * as styledEl from './ModalDescription.styled'

export interface ModalDescriptionProps {
  children: ReactNode
  className?: string
}

/** Secondary body copy; render outside `Modal.Content` so horizontal padding matches `ModalHeader`. */
export function ModalDescription({ children, className }: ModalDescriptionProps): ReactNode {
  return <styledEl.Description className={className}>{children}</styledEl.Description>
}

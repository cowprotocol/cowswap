import { ReactNode } from 'react'

import { X } from 'react-feather'

import * as styledEl from './styled'

import { BackButton } from '../BackButton'

export interface ModalHeaderProps {
  children?: ReactNode

  onBack?(): void

  onClose?(): void

  className?: string
}

export function ModalHeader({ children, className, onBack, onClose }: ModalHeaderProps): ReactNode {
  return (
    <styledEl.Header className={className} withoutBorder={true}>
      {onBack && (
        <div>
          <BackButton onClick={onBack} />
        </div>
      )}
      <styledEl.Title hasClose={!!onClose}>{children}</styledEl.Title>
      {onClose && (
        <div>
          <styledEl.IconButton onClick={onClose}>
            <X />
          </styledEl.IconButton>
        </div>
      )}
    </styledEl.Header>
  )
}

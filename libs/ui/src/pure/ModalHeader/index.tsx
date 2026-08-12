import { ReactNode } from 'react'

import clsx from 'clsx'

import * as styledEl from './styled'

export interface ModalHeaderProps {
  title?: ReactNode
  children?: ReactNode
  rightSlot?: ReactNode
  onBack?(): void
  onClose?(): void
  className?: string
}

// TODO: Move inside modal Modal directory

export function ModalHeader({ title, children, rightSlot, className, onBack, onClose }: ModalHeaderProps): ReactNode {
  const hasBack = !!onBack
  const hasClose = !!onClose

  return (
    <styledEl.Header className={clsx(className, hasBack && 'hasBack', hasClose && 'hasClose')} withoutBorder>
      <styledEl.BackButton aria-hidden={!hasBack} disabled={!hasBack} onClick={onBack} />

      <styledEl.Title>{title || children}</styledEl.Title>

      {rightSlot ? <styledEl.RightSlot>{rightSlot}</styledEl.RightSlot> : null}

      <styledEl.CloseButton aria-hidden={!hasClose} disabled={!hasClose} onClick={onClose} />
    </styledEl.Header>
  )
}

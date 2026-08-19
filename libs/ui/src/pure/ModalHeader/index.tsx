import { ReactNode } from 'react'

import clsx from 'clsx'

import * as styledEl from './styled'

export interface ModalHeaderProps {
  sticky?: boolean
  title?: ReactNode
  children?: ReactNode
  rightSlot?: ReactNode
  onBack?(): void
  onClose?(): void
  className?: string
}

// TODO: Move inside modal Modal directory

export function ModalHeader({
  sticky,
  title,
  children,
  rightSlot,
  className,
  onBack,
  onClose,
}: ModalHeaderProps): ReactNode {
  const hasBack = !!onBack
  const hasClose = !!onClose
  const rootClass = clsx(className, hasBack && 'hasBack', hasClose && 'hasClose', sticky && 'sticky')

  return (
    <styledEl.Header className={rootClass} withoutBorder>
      <styledEl.Inner>
        <styledEl.BackButton aria-hidden={!hasBack} disabled={!hasBack} onClick={onBack} />

        <styledEl.Title>{title || children || '\u00A0'}</styledEl.Title>

        {rightSlot ? <styledEl.RightSlot>{rightSlot}</styledEl.RightSlot> : null}

        <styledEl.CloseButton aria-hidden={!hasClose} disabled={!hasClose} onClick={onClose} />
      </styledEl.Inner>
    </styledEl.Header>
  )
}

import { ReactNode } from 'react'

import clsx from 'clsx'

import * as styledEl from './styled'

export interface ModalHeaderProps {
  children?: ReactNode

  title?: ReactNode

  rightSlot?: ReactNode

  onBack?(): void

  onClose?(): void

  className?: string
}

export function ModalHeader({ title, children, rightSlot, className, onBack, onClose }: ModalHeaderProps): ReactNode {
  //  onKeyDown={(e) => e.key === 'Escape' && onDismiss()}
  // TODO: Use CloseButton / BackButton components...

  return (
    <styledEl.Header className={clsx(className, onBack && 'hasBack', onClose && 'hasClose')} withoutBorder>
      {onBack ? <styledEl.BackButtonStyled onClick={onBack} /> : null}

      <styledEl.Title>{title || children}</styledEl.Title>

      {rightSlot ? <styledEl.RightSlot>{rightSlot}</styledEl.RightSlot> : null}

      {onClose ? <styledEl.CloseButtonStyled onClick={onClose} /> : null}
    </styledEl.Header>
  )
}

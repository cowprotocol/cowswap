import { ReactNode } from 'react'

import { X } from 'react-feather'

import * as styledEl from './styled'

export { IconButton } from './styled'

export interface ModalHeaderProps {
  children?: ReactNode

  title?: ReactNode

  rightSlot?: ReactNode

  onBack?(): void

  onClose?(): void

  className?: string
}

export function ModalHeader({ title, children, rightSlot, className, onBack, onClose }: ModalHeaderProps): ReactNode {
  const headerClassName = [className, onBack ? 'hasBack' : null, onClose ? 'hasClose' : null].filter(Boolean).join(' ')

  //  onKeyDown={(e) => e.key === 'Escape' && onDismiss()}
  // TODO: Use CloseButton / BackButton components...

  return (
    <styledEl.Header className={headerClassName} withoutBorder>
      {onBack ? <styledEl.BackButtonStyled onClick={onBack} /> : null}

      <styledEl.Title>{title || children}</styledEl.Title>

      {rightSlot ? <styledEl.RightSlot>{rightSlot}</styledEl.RightSlot> : null}

      {onClose ? (
        <styledEl.CloseButtonStyled onClick={onClose}>
          <X />
        </styledEl.CloseButtonStyled>
      ) : null}
    </styledEl.Header>
  )
}

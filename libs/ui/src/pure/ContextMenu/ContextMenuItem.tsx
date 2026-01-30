import { ReactNode, forwardRef } from 'react'

import * as styledEl from './styled'

export const ContextMenuItem = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode
    className?: string
    onSelect?: () => void
    disabled?: boolean
    variant?: 'danger'
  }
>(function ContextMenuItem({ children, className, onSelect, disabled, variant }, ref): ReactNode {
  return (
    <styledEl.ContextMenuItem
      ref={ref}
      className={className}
      onSelect={onSelect || (() => {})}
      disabled={disabled}
      variant={variant}
    >
      {children}
    </styledEl.ContextMenuItem>
  )
})

import { ReactNode } from 'react'

import { Icon } from 'react-feather'

import * as styledEl from './IconButton.styled'

import { UI } from '../../enum'
import { asCSSVars } from '../../utils/asCSSVars'

export interface IconButtonProps {
  size?: number
  color?: string
  colorHover?: string
  /** Expands the tap target via `::before` inset, e.g. `'-11px -17px'`. */
  pressableInset?: string
  className?: string
  icon: Icon
  disabled?: boolean
  'aria-hidden'?: boolean
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void
}

export type SpecificIconButtonProps = Omit<IconButtonProps, 'icon'>

export function IconButton({
  size = 18,
  color = `var(${UI.COLOR_TEXT_OPACITY_50})`,
  colorHover = `var(${UI.COLOR_TEXT})`,
  pressableInset,
  className,
  icon: Icon,
  disabled,
  'aria-hidden': ariaHidden,
  onClick,
}: IconButtonProps): ReactNode {
  return (
    <styledEl.Button
      className={className}
      style={asCSSVars({ size, color, colorHover, pressableInset })}
      disabled={disabled}
      aria-hidden={ariaHidden}
      onClick={onClick}
    >
      <Icon size="1em" color="currentColor" />
    </styledEl.Button>
  )
}

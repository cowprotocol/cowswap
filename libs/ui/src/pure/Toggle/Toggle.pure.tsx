import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'

import * as styledEl from './Toggle.styled'

import { UI } from '../../enum'
import { asCSSVars } from '../../utils/asCSSVars'

export interface ToggleProps {
  root?: 'label' | 'span' | 'a'
  id?: string
  checked: boolean
  toggle: Command
  disabled?: boolean
  variant?: ToggleVariant
  bgColor?: string
  inactiveBgColor?: string
  activeBgColor?: string
  hoverBgColor?: string
  className?: string
  'data-click-event'?: string
  href?: string
  target?: string
  rel?: string
  'aria-label'?: string
}

export type ToggleVariant = 'default' | 'success'

type ToggleColorVars = {
  'thumb-active'?: string
  'track-active'?: string
  'thumb-hover-checked'?: string
}

const COLORS_BY_VARIANT: Record<ToggleVariant, ToggleColorVars> = {
  default: {},
  success: {
    'thumb-active': `var(${UI.COLOR_SUCCESS_TEXT})`,
    'track-active': `color-mix(in srgb, var(${UI.COLOR_SUCCESS_TEXT}) 25%, transparent)`,
    'thumb-hover-checked': `var(${UI.COLOR_SUCCESS})`,
  },
}

export function Toggle({
  root: Root = 'label',
  id,
  checked,
  toggle,
  disabled,
  variant = 'default',
  bgColor,
  inactiveBgColor,
  activeBgColor,
  hoverBgColor,
  className,
  'data-click-event': dataClickEvent,
  href,
  target,
  rel,
  'aria-label': ariaLabel,
}: ToggleProps): ReactNode {
  // A checkbox nested in an <a> is invalid content model and reads as mixed
  // "checkbox" + "link" semantics to assistive tech - hide it and describe the
  // control via the anchor's aria-label instead.
  const isLink = Root === 'a'
  const variantColors = COLORS_BY_VARIANT[variant]

  return (
    <styledEl.Wrapper
      as={Root}
      id={id}
      href={href}
      target={target}
      rel={rel}
      className={className}
      aria-label={isLink ? ariaLabel : undefined}
      style={asCSSVars({
        'track-inactive': inactiveBgColor,
        'track-active': activeBgColor ?? variantColors['track-active'],
        'thumb-active': bgColor ?? variantColors['thumb-active'],
        'thumb-hover-checked': hoverBgColor ?? variantColors['thumb-hover-checked'],
      })}
      data-click-event={dataClickEvent}
    >
      <styledEl.Input
        type="checkbox"
        checked={checked}
        onChange={() => toggle()}
        disabled={disabled}
        aria-hidden={isLink || undefined}
      />
      <styledEl.ToggleThumb />
    </styledEl.Wrapper>
  )
}

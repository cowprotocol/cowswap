import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'

import * as styledEl from './Toggle.styled'

export interface ToggleProps {
  root?: 'label' | 'span' | 'a'
  id?: string
  checked: boolean
  toggle: Command
  disabled?: boolean
  bgColor?: string
  inactiveBgColor?: string
  'data-click-event'?: string
  href?: string
  target?: string
  rel?: string
  'aria-label'?: string
}

export function Toggle({
  root: Root = 'label',
  id,
  checked,
  toggle,
  disabled,
  bgColor,
  inactiveBgColor,
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

  return (
    <styledEl.Wrapper
      as={Root}
      id={id}
      href={href}
      target={target}
      rel={rel}
      aria-label={isLink ? ariaLabel : undefined}
      $bgColor={bgColor}
      $inactiveBgColor={inactiveBgColor}
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

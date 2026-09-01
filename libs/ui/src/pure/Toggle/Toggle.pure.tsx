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
}: ToggleProps): ReactNode {
  return (
    <styledEl.Wrapper
      as={Root}
      id={id}
      href={href}
      target={target}
      rel={rel}
      $bgColor={bgColor}
      $inactiveBgColor={inactiveBgColor}
      data-click-event={dataClickEvent}
    >
      <styledEl.Input type="checkbox" checked={checked} onChange={() => toggle()} disabled={disabled} />
      <styledEl.ToggleThumb />
    </styledEl.Wrapper>
  )
}

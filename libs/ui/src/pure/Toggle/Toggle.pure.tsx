import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'

import * as styledEl from './Toggle.styled'

export interface ToggleProps {
  root: 'label' | 'span'
  id?: string
  checked: boolean
  toggle: Command
  disabled?: boolean
  bgColor?: string
  inactiveBgColor?: string
  'data-click-event'?: string
}

export function Toggle({
  root: Root,
  id,
  checked,
  toggle,
  disabled,
  bgColor,
  inactiveBgColor,
  'data-click-event': dataClickEvent,
}: ToggleProps): ReactNode {
  return (
    <styledEl.Wrapper
      as={Root}
      id={id}
      $bgColor={bgColor}
      $inactiveBgColor={inactiveBgColor}
      data-click-event={dataClickEvent}
    >
      <styledEl.Input type="checkbox" checked={checked} onChange={() => toggle()} disabled={disabled} />
      <styledEl.ToggleThumb />
    </styledEl.Wrapper>
  )
}

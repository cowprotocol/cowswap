import { type ReactNode, useState } from 'react'

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import ms from 'ms.macro'

import * as styledEl from './Tooltip.styled'

const CLOSE_DELAY_MS = ms`0.3s`

export interface NewTooltipProps {
  content: ReactNode
  children: ReactNode
  placement?: TooltipPlacement
  /**
   * When true, hovering the popup does not keep it open — leaving the trigger closes it.
   * @default false
   */
  disableHoverablePopup?: boolean
  /** Override provider close delay (ms). */
  closeDelay?: number
  className?: string
}
export type TooltipPlacement = Side | `${Side}-${Exclude<Align, 'center'>}`

type Align = 'start' | 'center' | 'end'

type Side = 'top' | 'right' | 'bottom' | 'left'

export function NewTooltip(props: NewTooltipProps): ReactNode {
  const {
    content,
    children,
    placement = 'top',
    disableHoverablePopup = false,
    closeDelay = CLOSE_DELAY_MS,
    className,
  } = props
  const [side, align = 'center'] = placement.split('-') as [Side, Align?]
  const [open, setOpen] = useState(false)

  return (
    <BaseTooltip.Provider delay={0} closeDelay={closeDelay}>
      <BaseTooltip.Root open={open} disableHoverablePopup={disableHoverablePopup} onOpenChange={setOpen}>
        <BaseTooltip.Trigger
          closeOnClick={false}
          delay={0}
          closeDelay={closeDelay}
          render={(triggerProps) => (
            <styledEl.Trigger
              {...triggerProps}
              className={[triggerProps.className, className].filter(Boolean).join(' ')}
            />
          )}
          onPointerEnter={(event) => {
            if (isMouseLikePointerType(event.pointerType)) {
              setOpen(true)
            }
          }}
          onPointerLeave={() => {
            if (disableHoverablePopup) {
              setOpen(false)
            }
          }}
        >
          {children}
        </BaseTooltip.Trigger>
        <BaseTooltip.Portal>
          <styledEl.Positioner side={side} align={align} sideOffset={8}>
            <styledEl.Popup {...(disableHoverablePopup ? { 'data-non-interactive': '' } : undefined)}>
              <styledEl.Arrow />
              {content}
            </styledEl.Popup>
          </styledEl.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  )
}

function isMouseLikePointerType(pointerType: string): boolean {
  return pointerType === 'mouse' || pointerType === 'pen' || pointerType === ''
}

'use client'

import {
  cloneElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import { createPortal } from 'react-dom'

import styles from './Tooltip.module.css'
import { getTooltipPosition, type TooltipPosition } from './tooltipPosition'

import { useDismissOnOutsideInteraction } from '@/shared/lib/dismiss'

interface TooltipProps {
  content: ReactNode
  /** A single element, which gets `content` as its accessible description */
  children: ReactElement<{ 'aria-describedby'?: string }>
}

export function Tooltip({ content, children }: TooltipProps): ReactNode {
  const descriptionId = useId()
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<TooltipPosition | null>(null)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => {
    setIsOpen(false)
    setPosition(null)
  }, [])

  // The tooltip is fixed to the viewport, so `overflow` of the trigger's containers doesn't clip it
  useLayoutEffect(() => {
    const trigger = triggerRef.current?.firstElementChild
    const tooltip = tooltipRef.current

    if (!isOpen || !trigger || !tooltip) return

    setPosition(
      getTooltipPosition(
        trigger.getBoundingClientRect(),
        tooltip.getBoundingClientRect(),
        document.documentElement.clientWidth,
      ),
    )
  }, [isOpen])

  useDismissOnOutsideInteraction(isOpen, [triggerRef], close)

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, close])

  const describedBy = [children.props['aria-describedby'], descriptionId].filter(Boolean).join(' ')

  return (
    <span
      ref={triggerRef}
      className={styles.trigger}
      onPointerEnter={open}
      // A touch pointer leaves right after the tap, so the tooltip stays open until the next tap elsewhere
      onPointerLeave={(event) => event.pointerType !== 'touch' && close()}
      onFocus={open}
      onBlur={close}
    >
      {cloneElement(children, { 'aria-describedby': describedBy })}
      <span id={descriptionId} hidden>
        {content}
      </span>
      {isOpen &&
        createPortal(
          <div
            ref={tooltipRef}
            className={styles.tooltip}
            aria-hidden="true"
            style={position ? { top: position.top, left: position.left } : { visibility: 'hidden' }}
          >
            {content}
          </div>,
          document.body,
        )}
    </span>
  )
}

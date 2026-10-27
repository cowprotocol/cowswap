'use client'

import {
  type PointerEvent,
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
  children: ReactNode
  /** Class of the trigger, a `span` wrapping `children` */
  className?: string
}

const FOCUSABLE_SELECTOR = 'a[href], button, input, select, textarea, [tabindex]'

export function Tooltip({ content, children, className }: TooltipProps): ReactNode {
  const tooltipId = useId()
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const isHoveredRef = useRef(false)
  const isFocusedRef = useRef(false)
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<TooltipPosition | null>(null)
  const [hasFocusableChild, setHasFocusableChild] = useState(false)

  const close = useCallback((): void => {
    setIsOpen(false)
    setPosition(null)
  }, [])

  useLayoutEffect(() => {
    setHasFocusableChild(!!triggerRef.current?.querySelector(FOCUSABLE_SELECTOR))
  }, [children])

  // Fixed to the viewport, so an `overflow: auto` table can't clip it
  useLayoutEffect(() => {
    const trigger = triggerRef.current
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

  // A tap fires `pointerleave` right after `pointerenter`, so touch tooltips stay open until the next tap
  const onPointerEnter = (event: PointerEvent): void => {
    if (event.pointerType !== 'touch') isHoveredRef.current = true
    setIsOpen(true)
  }
  const onPointerLeave = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') return

    isHoveredRef.current = false
    if (!isFocusedRef.current) close()
  }
  const onFocus = (): void => {
    isFocusedRef.current = true
    setIsOpen(true)
  }
  const onBlur = (): void => {
    isFocusedRef.current = false
    if (!isHoveredRef.current) close()
  }

  return (
    <>
      <span
        ref={triggerRef}
        className={className}
        tabIndex={hasFocusableChild ? undefined : 0}
        aria-describedby={isOpen ? tooltipId : undefined}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {children}
      </span>
      {isOpen &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            className={styles.tooltip}
            role="tooltip"
            style={position ? { top: position.top, left: position.left } : { visibility: 'hidden' }}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  )
}

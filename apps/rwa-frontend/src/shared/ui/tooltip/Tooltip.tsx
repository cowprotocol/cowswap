'use client'

import {
  type PointerEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import { createPortal } from 'react-dom'

import styles from './Tooltip.module.css'

interface TooltipPosition {
  top: number
  left: number
}

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  /** Class of the trigger, a `span` wrapping `children` */
  className?: string
}

const TOOLTIP_OFFSET_PX = 6
const VIEWPORT_MARGIN_PX = 8

export function Tooltip({ content, children, className }: TooltipProps): ReactNode {
  const tooltipId = useId()
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<TooltipPosition | null>(null)

  const close = useCallback((): void => {
    setIsOpen(false)
    setPosition(null)
  }, [])

  // Fixed to the viewport, so an `overflow: auto` table can't clip it
  useLayoutEffect(() => {
    const trigger = triggerRef.current
    const tooltip = tooltipRef.current

    if (!isOpen || !trigger || !tooltip) return

    setPosition(getPosition(trigger.getBoundingClientRect(), tooltip.getBoundingClientRect()))
  }, [isOpen])

  useDismiss(isOpen, triggerRef, close)

  // A tap fires `pointerleave` right after `pointerenter`, so touch tooltips stay open until the next tap
  const onPointerLeave = (event: PointerEvent): void => {
    if (event.pointerType !== 'touch') close()
  }

  return (
    <>
      <span
        ref={triggerRef}
        className={className}
        aria-describedby={isOpen ? tooltipId : undefined}
        onPointerEnter={() => setIsOpen(true)}
        onPointerLeave={onPointerLeave}
        onFocus={() => setIsOpen(true)}
        onBlur={close}
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

/** Above the trigger, or below it when there is no room above, kept inside the viewport */
function getPosition(trigger: DOMRect, tooltip: DOMRect): TooltipPosition {
  const above = trigger.top - tooltip.height - TOOLTIP_OFFSET_PX
  const top = above >= VIEWPORT_MARGIN_PX ? above : trigger.bottom + TOOLTIP_OFFSET_PX
  const centered = trigger.left + trigger.width / 2 - tooltip.width / 2
  const maxLeft = window.innerWidth - tooltip.width - VIEWPORT_MARGIN_PX

  return { top, left: Math.max(VIEWPORT_MARGIN_PX, Math.min(centered, maxLeft)) }
}

function useDismiss(isOpen: boolean, triggerRef: RefObject<HTMLElement | null>, close: () => void): void {
  useEffect(() => {
    if (!isOpen) return

    const onPointerDown = (event: globalThis.PointerEvent): void => {
      const { target } = event

      if (target instanceof Node && triggerRef.current?.contains(target)) return
      close()
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') close()
    }
    const onViewportChange = (): void => close()

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onViewportChange, true)
    window.addEventListener('resize', onViewportChange)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onViewportChange, true)
      window.removeEventListener('resize', onViewportChange)
    }
  }, [isOpen, triggerRef, close])
}

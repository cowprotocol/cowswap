'use client'

import {
  cloneElement,
  type ReactElement,
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
import { getTooltipPosition, type TooltipPosition } from './tooltipPosition'

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

  useDismiss(isOpen, triggerRef, close)

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

function useDismiss(isOpen: boolean, triggerRef: RefObject<HTMLElement | null>, close: () => void): void {
  useEffect(() => {
    if (!isOpen) return

    const onPointerDown = (event: PointerEvent): void => {
      if (event.target instanceof Node && !triggerRef.current?.contains(event.target)) close()
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [isOpen, triggerRef, close])
}

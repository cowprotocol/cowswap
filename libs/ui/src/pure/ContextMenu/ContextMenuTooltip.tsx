import { KeyboardEvent, MouseEvent, ReactNode, useEffect, useId, useRef, useState } from 'react'

import { t } from '@lingui/core/macro'

import * as styledEl from './styled'

import { Tooltip } from '../Tooltip'

interface ContextMenuTooltipProps {
  children: ReactNode
  content: ReactNode
  ariaLabel?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  containerRef?: React.RefObject<HTMLDivElement | null>
  disableHoverBackground?: boolean
  triggerSize?: number
}

export function ContextMenuTooltip({
  children,
  content,
  ariaLabel = t`More options`,
  placement = 'bottom',
  containerRef,
  disableHoverBackground,
  triggerSize,
}: ContextMenuTooltipProps): ReactNode {
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const defaultContainerRef = useRef<HTMLButtonElement>(null)
  const initialFocusRef = useRef<'first' | 'last'>('first')
  const menuId = useId()
  const [openTooltip, setOpenTooltip] = useState(false)

  useInitialMenuFocus(openTooltip, contextMenuRef, initialFocusRef)

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation?.()
    event.preventDefault?.()
    setOpenTooltip((isOpen) => {
      if (!isOpen) initialFocusRef.current = 'first'
      return !isOpen
    })
  }

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

    event.preventDefault()
    event.stopPropagation()
    initialFocusRef.current = event.key === 'ArrowUp' ? 'last' : 'first'
    setOpenTooltip(true)
  }

  // Click outside handler
  useEffect(() => {
    if (!openTooltip) return

    const handleClickOutside = (event: Event): void => {
      const target = event.target as HTMLElement

      // Only close if clicking outside the context menu
      if (!contextMenuRef.current?.contains(target) && !defaultContainerRef.current?.contains(target)) {
        setOpenTooltip(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openTooltip])

  // Close on menu item click. Portal events still bubble through the React tree to
  // ContextMenuTooltipButton, so stopPropagation is required to avoid re-opening.
  const closeAndRestoreFocus = (): void => {
    setOpenTooltip(false)
    defaultContainerRef.current?.focus()
  }

  const handleTooltipClick = (event: MouseEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLElement
    const isAnchor = target.tagName === 'A' || Boolean(target.closest('a'))

    // Don't preventDefault for anchors, let navigation work naturally
    if (!isAnchor) {
      event.preventDefault()
    }

    event.stopPropagation()
    closeAndRestoreFocus()
  }

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeAndRestoreFocus()
      return
    }

    handleMenuNavigation(event, contextMenuRef.current)
  }

  return (
    <Tooltip
      content={
        <styledEl.ContextMenuContent
          ref={contextMenuRef}
          id={menuId}
          role="menu"
          aria-orientation="vertical"
          onClick={handleTooltipClick}
          onKeyDown={handleMenuKeyDown}
        >
          {content}
        </styledEl.ContextMenuContent>
      }
      placement={placement}
      wrapInContainer={false}
      show={openTooltip}
      containerRef={(containerRef as React.RefObject<HTMLElement>) || defaultContainerRef}
    >
      <styledEl.ContextMenuTooltipButton
        ref={defaultContainerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={openTooltip}
        aria-controls={openTooltip ? menuId : undefined}
        onClick={handleClick}
        onKeyDown={handleTriggerKeyDown}
        disableHoverBackground={disableHoverBackground}
        $triggerSize={triggerSize}
      >
        {children}
      </styledEl.ContextMenuTooltipButton>
    </Tooltip>
  )
}

function getMenuItems(menu: HTMLDivElement | null): HTMLElement[] {
  if (!menu) return []

  return Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"]):not(:disabled)'))
}

function handleMenuNavigation(event: KeyboardEvent<HTMLDivElement>, menu: HTMLDivElement | null): void {
  const items = getMenuItems(menu)
  const currentIndex = items.findIndex((item) => item === document.activeElement)
  let nextIndex: number | null = null

  if (event.key === 'ArrowDown') nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
  if (event.key === 'ArrowUp') nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
  if (event.key === 'Home') nextIndex = 0
  if (event.key === 'End') nextIndex = items.length - 1

  if (nextIndex === null) return

  event.preventDefault()
  event.stopPropagation()
  items[nextIndex]?.focus()
}

function useInitialMenuFocus(
  openTooltip: boolean,
  contextMenuRef: React.RefObject<HTMLDivElement | null>,
  initialFocusRef: { current: 'first' | 'last' },
): void {
  useEffect(() => {
    if (!openTooltip) return

    const focusTimer = window.setTimeout(() => {
      const items = getMenuItems(contextMenuRef.current)
      const target = initialFocusRef.current === 'last' ? items.at(-1) : items[0]
      target?.focus()
    }, 0)

    return () => window.clearTimeout(focusTimer)
  }, [openTooltip, contextMenuRef, initialFocusRef])
}

'use client'

import {
  type KeyboardEvent,
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

import styles from './RowMenu.module.css'

import { MoreIcon } from '@/shared/ui/icons'

export interface RowMenuItem {
  label: string
  description?: string
  onSelect: () => void
}

interface RowMenuProps {
  /** Accessible name of the trigger button */
  label: string
  items: RowMenuItem[]
}

const MENU_OFFSET_PX = 4

interface MenuPosition {
  top: number
  right: number
}

export function RowMenu({ label, items }: RowMenuProps): ReactNode {
  const menuId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<MenuPosition | null>(null)
  const isOpen = position !== null

  const close = useCallback((restoreFocus: boolean) => {
    setPosition(null)
    if (restoreFocus) triggerRef.current?.focus()
  }, [])

  const toggle = (): void => {
    const trigger = triggerRef.current

    if (isOpen || !trigger) {
      close(false)
      return
    }

    const rect = trigger.getBoundingClientRect()
    setPosition({ top: rect.bottom + MENU_OFFSET_PX, right: window.innerWidth - rect.right })
  }

  // The table scrolls inside an `overflow: auto` box that would clip an absolutely positioned menu,
  // so the menu is fixed to the viewport and flips above the trigger when it doesn't fit below
  useLayoutEffect(() => {
    const menu = menuRef.current
    const trigger = triggerRef.current

    if (!isOpen || !menu || !trigger) return

    const menuRect = menu.getBoundingClientRect()

    if (menuRect.bottom > window.innerHeight) {
      const triggerRect = trigger.getBoundingClientRect()
      const top = Math.max(MENU_OFFSET_PX, triggerRect.top - menuRect.height - MENU_OFFSET_PX)

      if (top !== menuRect.top) setPosition((current) => current && { ...current, top })
    }

    menu.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus()
  }, [isOpen])

  useDismissOnOutsideInteraction(isOpen, triggerRef, menuRef, close)

  return (
    <>
      <button
        ref={triggerRef}
        className={styles.trigger}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={toggle}
      >
        <MoreIcon />
      </button>
      {position &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            className={styles.menu}
            role="menu"
            aria-label={label}
            style={{ top: position.top, right: position.right }}
            onKeyDown={(event) => onMenuKeyDown(event, close)}
          >
            {items.map((item) => (
              <button
                key={item.label}
                className={styles.item}
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  close(true)
                  item.onSelect()
                }}
              >
                {item.label}
                {item.description && <span className={styles.description}>{item.description}</span>}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}

function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>, close: (restoreFocus: boolean) => void): void {
  if (event.key === 'Escape' || event.key === 'Tab') {
    event.preventDefault()
    close(true)
    return
  }

  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

  event.preventDefault()

  const menuItems = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]
  const index = menuItems.findIndex((item) => item === document.activeElement)
  const step = event.key === 'ArrowDown' ? 1 : -1

  menuItems[(index + step + menuItems.length) % menuItems.length]?.focus()
}

function useDismissOnOutsideInteraction(
  isOpen: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  menuRef: RefObject<HTMLElement | null>,
  close: (restoreFocus: boolean) => void,
): void {
  useEffect(() => {
    if (!isOpen) return

    const onPointerDown = (event: PointerEvent): void => {
      const { target } = event

      if (!(target instanceof Node)) return
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) close(false)
    }
    const onViewportChange = (): void => close(false)

    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('scroll', onViewportChange, true)
    window.addEventListener('resize', onViewportChange)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('scroll', onViewportChange, true)
      window.removeEventListener('resize', onViewportChange)
    }
  }, [isOpen, triggerRef, menuRef, close])
}

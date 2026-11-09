import { type RefObject, useEffect } from 'react'

interface DismissOnEscapeOptions {
  /** Takes the key before the overlays beneath, for an overlay that can open over another one */
  capture?: boolean
}

const openOverlays: symbol[] = []

/**
 * Closes the overlay opened last on Escape wherever the focus is, and returns the focus to its `triggerRef`. An Escape
 * that another control handled is left alone, and this one is marked handled in turn
 */
export function useDismissOnEscape(
  isOpen: boolean,
  close: () => void,
  triggerRef: RefObject<HTMLElement | null>,
  { capture = false }: DismissOnEscapeOptions = {},
): void {
  useEffect(() => {
    if (!isOpen) return

    const overlay = Symbol()
    openOverlays.push(overlay)

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape' || event.defaultPrevented || openOverlays.at(-1) !== overlay) return

      event.preventDefault()
      close()
      triggerRef.current?.focus()
    }

    document.addEventListener('keydown', onKeyDown, capture)

    return () => {
      document.removeEventListener('keydown', onKeyDown, capture)
      openOverlays.splice(openOverlays.indexOf(overlay), 1)
    }
  }, [isOpen, close, triggerRef, capture])
}

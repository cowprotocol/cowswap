import { type RefObject, useEffect } from 'react'

interface DismissOnEscapeOptions {
  /** Takes the key before the overlays beneath, for an overlay that can open over another one */
  capture?: boolean
}

/**
 * Closes an overlay on Escape wherever the focus is, and returns the focus to `triggerRef`. An Escape that another
 * control handled is left alone, and this one is marked handled in turn
 */
export function useDismissOnEscape(
  isOpen: boolean,
  close: () => void,
  triggerRef: RefObject<HTMLElement | null>,
  { capture = false }: DismissOnEscapeOptions = {},
): void {
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape' || event.defaultPrevented) return

      event.preventDefault()
      close()
      triggerRef.current?.focus()
    }

    document.addEventListener('keydown', onKeyDown, capture)

    return () => document.removeEventListener('keydown', onKeyDown, capture)
  }, [isOpen, close, triggerRef, capture])
}

import { type RefObject, useEffect } from 'react'

/**
 * Closes a popup when the user presses outside `refs`, or, unless `closeOnScroll` is false, when the page scrolls or
 * resizes and a popup fixed to the viewport would detach from its trigger. Scrolling inside `refs` keeps it open
 */
export function useDismissOnOutsideInteraction(
  isOpen: boolean,
  refs: RefObject<HTMLElement | null>[],
  close: () => void,
  closeOnScroll = true,
): void {
  useEffect(() => {
    if (!isOpen) return

    const isInside = (target: EventTarget | null): boolean =>
      target instanceof Node && refs.some((ref) => ref.current?.contains(target))
    const onPointerDown = (event: PointerEvent): void => {
      if (!isInside(event.target)) close()
    }
    const onScroll = (event: Event): void => {
      if (!isInside(event.target)) close()
    }

    document.addEventListener('pointerdown', onPointerDown)

    if (!closeOnScroll) return () => document.removeEventListener('pointerdown', onPointerDown)

    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', close)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', close)
    }
    // `refs` is a new array on every render, while the refs in it are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, close, closeOnScroll])
}

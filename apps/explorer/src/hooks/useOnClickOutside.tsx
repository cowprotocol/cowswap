import { useEffect, RefObject } from 'react'

type Event = MouseEvent | TouchEvent

const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void,
): void => {
  useEffect(() => {
    const listener = (event: Event): void => {
      const el = ref?.current
      if (!el || el.contains((event?.target as Node) || null)) {
        return
      }

      handler(event) // Call the handler only if the click is outside of the element passed.
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return (): void => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler]) // Reload only if ref or handler changes
}

export default useOnClickOutside

import { RefObject, useEffect, useState } from 'react'

export function useIsScrolled(elementRef: RefObject<HTMLElement | null>): boolean {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) {
      return
    }

    const updateIsScrolled = (): void => {
      setIsScrolled(element.scrollTop > 0)
    }

    updateIsScrolled()
    element.addEventListener('scroll', updateIsScrolled, { passive: true })

    return () => {
      element.removeEventListener('scroll', updateIsScrolled)
    }
  }, [elementRef])

  return isScrolled
}

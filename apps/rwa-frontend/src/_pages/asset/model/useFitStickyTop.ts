import { type RefObject, useEffect } from 'react'

import { getStickyTop } from '../lib/stickyTop'

const STICKY_TOP_CSS_VAR = '--sticky-top'

/** Sets `--sticky-top` on the element, so a sticky element taller than the viewport still shows its bottom */
export function useFitStickyTop(ref: RefObject<HTMLElement | null>, gap: number): void {
  useEffect(() => {
    const element = ref.current

    if (!element) return

    const update = (): void => {
      element.style.setProperty(STICKY_TOP_CSS_VAR, `${getStickyTop(window.innerHeight, element.offsetHeight, gap)}px`)
    }
    const observer = new ResizeObserver(update)

    update()
    observer.observe(element, { box: 'border-box' })
    window.addEventListener('resize', update)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [ref, gap])
}

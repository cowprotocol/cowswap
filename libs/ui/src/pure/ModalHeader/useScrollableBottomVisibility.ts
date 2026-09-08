import { RefObject, useEffect } from 'react'

import { useLatestRef } from '@cowprotocol/common-hooks'

const OVERLAY_SCROLL_ROOT_SELECTOR = '[data-modal-root]'

export function useScrollableBottomVisibility(
  slotRef: RefObject<HTMLElement | null>,
  headerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onVisibilityChange: ((visible: boolean) => void) | undefined,
): void {
  const onVisibilityChangeRef = useLatestRef(onVisibilityChange)

  useEffect(() => {
    const slot = slotRef.current
    const header = headerRef.current

    if (!enabled || !slot || typeof IntersectionObserver === 'undefined') return

    const root = slot.closest(OVERLAY_SCROLL_ROOT_SELECTOR)
    const headerHeight = header?.getBoundingClientRect().height ?? 0
    let lastVisible: boolean | undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        const visible = entry ? entry.isIntersecting : false

        if (lastVisible === visible) return

        lastVisible = visible
        onVisibilityChangeRef.current?.(visible)
      },
      {
        root,
        rootMargin: `-${headerHeight}px 0px 0px 0px`,
        threshold: 0,
      },
    )

    observer.observe(slot)

    return () => observer.disconnect()
  }, [enabled, headerRef, onVisibilityChangeRef, slotRef])
}

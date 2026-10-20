import { ReactNode, useLayoutEffect, useRef, useState } from 'react'

import * as styledEl from './ExpandableContent.styled'

export interface ExpandableContentProps {
  expanded: boolean
  children: ReactNode
  className?: string
}

/**
 * Animates open/close height (and opacity) and keeps height in sync when content resizes.
 */
export function ExpandableContent({ expanded, children, className }: ExpandableContentProps): ReactNode {
  const innerRef = useRef<HTMLDivElement>(null)
  const [heightPx, setHeightPx] = useState(0)

  useLayoutEffect(() => {
    const inner = innerRef.current

    if (!inner) {
      setHeightPx(0)
      return
    }

    const syncHeight = (): void => {
      // overflow:hidden on the measure target prevents margin-collapse from
      // under-reporting scrollHeight (margins would otherwise escape the box).
      const previousOverflow = inner.style.overflow
      inner.style.overflow = 'hidden'
      const nextHeight = expanded ? inner.scrollHeight : 0
      inner.style.overflow = previousOverflow
      setHeightPx(nextHeight)
    }

    syncHeight()

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(syncHeight)

    observer.observe(inner)

    return () => observer.disconnect()
  }, [expanded, children])

  return (
    <styledEl.ExpandableContent className={className} style={{ height: heightPx }} aria-hidden={!expanded}>
      <div ref={innerRef}>{children}</div>
    </styledEl.ExpandableContent>
  )
}

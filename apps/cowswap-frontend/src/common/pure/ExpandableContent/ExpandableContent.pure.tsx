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
      setHeightPx(expanded ? inner.scrollHeight : 0)
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

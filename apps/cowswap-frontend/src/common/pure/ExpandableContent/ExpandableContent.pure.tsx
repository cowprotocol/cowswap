import { ReactNode, useLayoutEffect, useRef, useState } from 'react'

import * as styledEl from './ExpandableContent.styled'

const BORDERED_FRAME_PX = 2

export interface ExpandableContentProps {
  expanded: boolean
  children: ReactNode
  variant?: 'default' | 'bordered'
  className?: string
}

/**
 * Animates open/close height (and opacity) and keeps height in sync when content resizes.
 */
export function ExpandableContent({
  expanded,
  children,
  variant = 'default',
  className,
}: ExpandableContentProps): ReactNode {
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
      const contentHeight = expanded ? inner.scrollHeight : 0
      // border-box: 1px border on each side must be added so content is not clipped
      const framePx = expanded && variant === 'bordered' ? BORDERED_FRAME_PX : 0
      inner.style.overflow = previousOverflow
      setHeightPx(contentHeight + framePx)
    }

    syncHeight()

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(syncHeight)

    observer.observe(inner)

    return () => observer.disconnect()
  }, [expanded, children, variant])

  return (
    <styledEl.ExpandableContent
      className={className}
      $variant={variant}
      style={{ height: heightPx }}
      aria-hidden={!expanded}
    >
      <div ref={innerRef}>{children}</div>
    </styledEl.ExpandableContent>
  )
}

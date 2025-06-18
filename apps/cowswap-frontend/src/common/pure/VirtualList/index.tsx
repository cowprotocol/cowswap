import { ReactNode, useCallback, useRef } from 'react'

import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual'
import ms from 'ms.macro'

import { ListInner, ListScroller, ListWrapper, LoadingRows } from './styled'

const scrollDelay = ms`400ms`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const threeDivs = () => (
  <>
    <div />
    <div />
    <div />
  </>
)

interface VirtualListProps<T> {
  id?: string
  items: T[]

  getItemView(items: T[], item: VirtualItem): ReactNode

  loading?: boolean
  estimateSize?: () => number
  children?: ReactNode
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function VirtualList<T>({
  id,
  items,
  loading,
  getItemView,
  children,
  estimateSize = () => 56,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>(undefined)

  const onScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
      if (wrapperRef.current) wrapperRef.current.style.pointerEvents = 'none'
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (wrapperRef.current) wrapperRef.current.style.pointerEvents = ''
    }, scrollDelay)
  }, [])

  const virtualizer = useVirtualizer({
    getScrollElement: () => parentRef.current,
    count: items.length,
    estimateSize,
    overscan: 5,
  })

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <ListWrapper id={id} ref={parentRef} onScroll={onScroll}>
      <ListInner ref={wrapperRef} style={{ height: virtualizer.getTotalSize() }}>
        <ListScroller style={{ transform: `translateY(${virtualItems[0]?.start ?? 0}px)` }}>
          {children}
          {virtualItems.map((item) => {
            if (loading) {
              return <LoadingRows key={item.key}>{threeDivs()}</LoadingRows>
            }

            return (
              <div key={item.key} data-index={item.index} ref={virtualizer.measureElement}>
                {getItemView(items, item)}
              </div>
            )
          })}
        </ListScroller>
      </ListInner>
    </ListWrapper>
  )
}

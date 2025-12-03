import { ReactNode, useCallback, useLayoutEffect, useRef } from 'react'

import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual'
import ms from 'ms.macro'

import { ListInner, ListScroller, ListWrapper, LoadingRows } from './styled'

const scrollDelay = ms`400ms`

const LoadingPlaceholder: () => ReactNode = () => {
  return (
    <>
      <div />
      <div />
      <div />
    </>
  )
}

interface VirtualListRowProps<T> {
  item: VirtualItem
  loading?: boolean
  items: T[]
  getItemView(items: T[], item: VirtualItem): ReactNode
  measureElement(element: Element | null): void
}

function VirtualListRow<T>({ item, loading, items, getItemView, measureElement }: VirtualListRowProps<T>): ReactNode {
  if (loading) {
    return (
      <LoadingRows>
        <LoadingPlaceholder />
      </LoadingRows>
    )
  }

  return (
    <div data-index={item.index} ref={measureElement}>
      {getItemView(items, item)}
    </div>
  )
}

interface VirtualListRowsProps<T> {
  virtualItems: VirtualItem[]
  loading?: boolean
  items: T[]
  getItemView(items: T[], item: VirtualItem): ReactNode
  measureElement(element: Element | null): void
}

function VirtualListRows<T>({
  virtualItems,
  loading,
  items,
  getItemView,
  measureElement,
}: VirtualListRowsProps<T>): ReactNode {
  return (
    <>
      {virtualItems.map((item) => (
        <VirtualListRow
          key={item.key}
          item={item}
          loading={loading}
          items={items}
          getItemView={getItemView}
          measureElement={measureElement}
        />
      ))}
    </>
  )
}

interface VirtualListProps<T> {
  id?: string
  items: T[]

  getItemView(items: T[], item: VirtualItem): ReactNode

  loading?: boolean
  estimateSize?: () => number
  children?: ReactNode
  scrollResetKey?: string | number | boolean
}

export function VirtualList<T>({
  id,
  items,
  loading,
  getItemView,
  children,
  estimateSize = () => 56,
  scrollResetKey,
}: VirtualListProps<T>): ReactNode {
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

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    getScrollElement: () => parentRef.current,
    count: items.length,
    estimateSize,
    overscan: 5,
  })

  useLayoutEffect(() => {
    if (scrollResetKey === undefined) {
      return
    }

    const scrollContainer = parentRef.current

    if (scrollContainer) {
      scrollContainer.scrollTop = 0
      scrollContainer.scrollLeft = 0

      if (typeof scrollContainer.scrollTo === 'function') {
        scrollContainer.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      }
    }

    virtualizer.scrollToOffset(0, { align: 'start' })
  }, [scrollResetKey, virtualizer])

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <ListWrapper id={id} ref={parentRef} onScroll={onScroll}>
      <ListInner ref={wrapperRef} style={{ height: virtualizer.getTotalSize() }}>
        <ListScroller style={{ transform: `translateY(${virtualItems[0]?.start ?? 0}px)` }}>
          {children}
          <VirtualListRows
            virtualItems={virtualItems}
            loading={loading}
            items={items}
            getItemView={getItemView}
            measureElement={virtualizer.measureElement}
          />
        </ListScroller>
      </ListInner>
    </ListWrapper>
  )
}

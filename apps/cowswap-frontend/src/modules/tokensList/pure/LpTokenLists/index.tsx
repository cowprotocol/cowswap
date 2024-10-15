import { useCallback, useRef } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { useVirtualizer } from '@tanstack/react-virtual'
import ms from 'ms.macro'

import { ListInner, ListScroller, ListWrapper, Wrapper } from './styled'

const scrollDelay = ms`400ms`

const estimateSize = () => 56

interface LpTokenListsProps {
  tokens: TokenWithLogo[]
}

export function LpTokenLists({ tokens }: LpTokenListsProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

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
    count: tokens.length,
    estimateSize,
    overscan: 5,
  })

  const items = virtualizer.getVirtualItems()

  return (
    <Wrapper>
      <div>
        <span>Pool</span>
        <span>Balance</span>
        <span>APR</span>
        <span></span>
      </div>
      <ListWrapper ref={parentRef} onScroll={onScroll}>
        <ListInner ref={wrapperRef} style={{ height: virtualizer.getTotalSize() }}>
          <ListScroller style={{ transform: `translateY(${items[0]?.start ?? 0}px)` }}>
            {items.map((item) => {
              const token = tokens[item.index]
              return (
                <div key={token.address} data-index={item.index} ref={virtualizer.measureElement}>
                  <span>{token.name}</span>
                  <span>---</span>
                  <span>40%</span>
                  <span></span>
                </div>
              )
            })}
          </ListScroller>
        </ListInner>
      </ListWrapper>
      <div>
        <div>Can' find?</div>
        <a>Create a pool</a>
      </div>
    </Wrapper>
  )
}

import { useCallback, useRef } from 'react'

import { LpToken } from '@cowprotocol/common-const'
import { TokenLogo, TokensByAddress } from '@cowprotocol/tokens'
import { InfoTooltip, TokenName, TokenSymbol } from '@cowprotocol/ui'

import { useVirtualizer } from '@tanstack/react-virtual'
import ms from 'ms.macro'

import {
  ListHeader,
  ListInner,
  ListItem,
  ListScroller,
  ListWrapper,
  LpTokenInfo,
  LpTokenLogo,
  LpTokenWrapper,
  Wrapper,
} from './styled'

const scrollDelay = ms`400ms`

const estimateSize = () => 56

interface LpTokenListsProps {
  lpTokens: LpToken[]
  tokensByAddress: TokensByAddress
}

export function LpTokenLists({ lpTokens, tokensByAddress }: LpTokenListsProps) {
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
    count: lpTokens.length,
    estimateSize,
    overscan: 5,
  })

  const items = virtualizer.getVirtualItems()

  return (
    <Wrapper>
      <ListHeader>
        <span>Pool</span>
        <span>Balance</span>
        <span>APR</span>
        <span></span>
      </ListHeader>
      <ListWrapper ref={parentRef} onScroll={onScroll}>
        <ListInner ref={wrapperRef} style={{ height: virtualizer.getTotalSize() }}>
          <ListScroller style={{ transform: `translateY(${items[0]?.start ?? 0}px)` }}>
            {items.map((item) => {
              const token = lpTokens[item.index]
              const token0 = token.tokens?.[0]?.toLowerCase()
              const token1 = token.tokens?.[1]?.toLowerCase()

              return (
                <ListItem key={token.address} data-index={item.index} ref={virtualizer.measureElement}>
                  <LpTokenWrapper>
                    <LpTokenLogo>
                      <div>
                        <TokenLogo token={tokensByAddress[token0]} sizeMobile={32} />
                      </div>
                      <div>
                        <TokenLogo token={tokensByAddress[token1]} sizeMobile={32} />
                      </div>
                    </LpTokenLogo>
                    <LpTokenInfo>
                      <strong>
                        <TokenSymbol token={token} />
                      </strong>
                      <p>
                        <TokenName token={token} />
                      </p>
                    </LpTokenInfo>
                  </LpTokenWrapper>
                  <span>---</span>
                  <span>40%</span>
                  <span>
                    <InfoTooltip>TODO</InfoTooltip>
                  </span>
                </ListItem>
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

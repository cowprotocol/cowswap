import { useCallback, useRef } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useVirtual } from '@tanstack/react-virtual'
import ms from 'ms.macro'
import styled from 'styled-components/macro'

import { CommonListContainer } from '../commonElements'
import { TokenListItem } from '../TokenListItem'

const TokensWrapper = styled(CommonListContainer)``

const TokensInner = styled.div`
  width: 100%;
  position: relative;
`

const estimateSize = () => 56

const scrollDelay = ms`400ms`

export interface TokensVirtualListProps {
  allTokens: TokenWithLogo[]
  selectedToken?: TokenWithLogo
  balances: { [key: string]: CurrencyAmount<Currency> }
  onSelectToken(token: TokenWithLogo): void
}
export function TokensVirtualList(props: TokensVirtualListProps) {
  const { allTokens, selectedToken, balances, onSelectToken } = props

  const scrollTimeoutRef = useRef<NodeJS.Timeout>()
  const parentRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const onScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
      if (wrapperRef.current) wrapperRef.current.style.pointerEvents = 'none'
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (wrapperRef.current) wrapperRef.current.style.pointerEvents = ''
    }, scrollDelay)
  }, [])

  const virtualizer = useVirtual({
    parentRef,
    size: allTokens.length,
    estimateSize,
    overscan: 5,
  })

  return (
    <TokensWrapper ref={parentRef} onScroll={onScroll}>
      <TokensInner ref={wrapperRef} style={{ height: `${virtualizer.totalSize}px` }}>
        {virtualizer.virtualItems.map((virtualRow) => {
          return (
            <TokenListItem
              key={virtualRow.key}
              virtualRow={virtualRow}
              token={allTokens[virtualRow.index]}
              selectedToken={selectedToken}
              balances={balances}
              onSelectToken={onSelectToken}
            />
          )
        })}
      </TokensInner>
    </TokensWrapper>
  )
}

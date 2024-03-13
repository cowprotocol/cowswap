import { useCallback, useMemo, useRef } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { useVirtualizer } from '@tanstack/react-virtual'
import ms from 'ms.macro'

import * as styledEl from './styled'

import { SelectTokenContext } from '../../types'
import { tokensListSorter } from '../../utils/tokensListSorter'
import { CommonListContainer } from '../commonElements'
import { TokenListItem } from '../TokenListItem'

const estimateSize = () => 56
const threeDivs = () => (
  <>
    <div />
    <div />
    <div />
  </>
)

const scrollDelay = ms`400ms`

export interface TokensVirtualListProps extends SelectTokenContext {
  allTokens: TokenWithLogo[]
}

export function TokensVirtualList(props: TokensVirtualListProps) {
  const { allTokens, selectedToken, balancesState, onSelectToken, unsupportedTokens, permitCompatibleTokens } = props
  const { values: balances, isLoading: balancesLoading } = balancesState

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

  const virtualizer = useVirtualizer({
    getScrollElement: () => parentRef.current,
    count: allTokens.length,
    estimateSize,
    overscan: 5,
  })

  const sortedTokens = useMemo(() => {
    return balances ? allTokens.sort(tokensListSorter(balances)) : allTokens
  }, [allTokens, balances])

  const items = virtualizer.getVirtualItems()

  return (
    <CommonListContainer id="tokens-list" ref={parentRef} onScroll={onScroll}>
      <styledEl.TokensInner ref={wrapperRef} style={{ height: virtualizer.getTotalSize() }}>
        <styledEl.TokensScroller style={{ transform: `translateY(${items[0]?.start ?? 0}px)` }}>
          {items.map((virtualRow) => {
            const token = sortedTokens[virtualRow.index]
            const addressLowerCase = token.address.toLowerCase()
            const balance = balances ? balances[token.address.toLowerCase()] : undefined

            if (balancesLoading) {
              return <styledEl.LoadingRows key={virtualRow.key}>{threeDivs()}</styledEl.LoadingRows>
            }

            return (
              <TokenListItem
                key={virtualRow.key}
                virtualRow={virtualRow}
                measureElement={virtualizer.measureElement}
                token={token}
                isUnsupported={!!unsupportedTokens[addressLowerCase]}
                isPermitCompatible={permitCompatibleTokens[addressLowerCase]}
                selectedToken={selectedToken}
                balance={balance}
                onSelectToken={onSelectToken}
              />
            )
          })}
        </styledEl.TokensScroller>
      </styledEl.TokensInner>
    </CommonListContainer>
  )
}

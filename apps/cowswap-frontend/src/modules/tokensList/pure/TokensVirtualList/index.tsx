import { useCallback, useMemo, useRef } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { LoadingRows as BaseLoadingRows } from '@cowprotocol/ui'

import { useVirtual } from '@tanstack/react-virtual'
import ms from 'ms.macro'
import styled from 'styled-components/macro'

import { TokenAmounts } from 'modules/tokens'

import { CommonListContainer } from '../commonElements'
import { TokenListItem } from '../TokenListItem'

const TokensWrapper = styled(CommonListContainer)``

const TokensInner = styled.div`
  width: 100%;
  position: relative;
`

const LoadingRows = styled(BaseLoadingRows)`
  grid-column-gap: 0.5em;
  grid-template-columns: repeat(12, 1fr);
  max-width: 960px;
  padding: 12px 20px;

  & > div:nth-child(4n + 1) {
    grid-column: 1 / 8;
    height: 1em;
    margin-bottom: 0.25em;
  }
  & > div:nth-child(4n + 2) {
    grid-column: 12;
    height: 1em;
    margin-top: 0.25em;
  }
  & > div:nth-child(4n + 3) {
    grid-column: 1 / 4;
    height: 0.75em;
  }
`

const estimateSize = () => 56

const scrollDelay = ms`400ms`

export interface TokensVirtualListProps {
  allTokens: TokenWithLogo[]
  selectedToken?: TokenWithLogo
  balances: TokenAmounts
  unsupportedTokens: { [tokenAddress: string]: { dateAdded: number } }
  permitCompatibleTokens: { [tokenAddress: string]: boolean }
  onSelectToken(token: TokenWithLogo): void
}

export function TokensVirtualList(props: TokensVirtualListProps) {
  const { allTokens, selectedToken, balances, onSelectToken, unsupportedTokens, permitCompatibleTokens } = props

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

  const sortedTokens = useMemo(() => {
    return allTokens.sort(tokensListSorter(balances))
  }, [allTokens, balances])

  const { virtualItems } = virtualizer

  return (
    <TokensWrapper ref={parentRef} onScroll={onScroll}>
      <TokensInner ref={wrapperRef} style={{ height: `${virtualizer.totalSize}px` }}>
        {virtualItems.map((virtualRow) => {
          const token = sortedTokens[virtualRow.index]
          const addressLowerCase = token.address.toLowerCase()
          const balance = balances[token.address]

          if (!balance || balance.loading) {
            return (
              <LoadingRows key={virtualRow.key}>
                <div />
                <div />
                <div />
              </LoadingRows>
            )
          }

          return (
            <TokenListItem
              key={virtualRow.key}
              virtualRow={virtualRow}
              token={token}
              isUnsupported={!!unsupportedTokens[addressLowerCase]}
              isPermitCompatible={permitCompatibleTokens[addressLowerCase]}
              selectedToken={selectedToken}
              balance={balance.value}
              onSelectToken={onSelectToken}
            />
          )
        })}
      </TokensInner>
    </TokensWrapper>
  )
}

function tokensListSorter(balances: TokenAmounts): (a: TokenWithLogo, b: TokenWithLogo) => number {
  return (a: TokenWithLogo, b: TokenWithLogo) => {
    const aBalance = balances[a.address]
    const bBalance = balances[b.address]

    if (aBalance?.value && bBalance?.value) {
      return +bBalance.value.toExact() - +aBalance.value.toExact()
    }

    return 0
  }
}

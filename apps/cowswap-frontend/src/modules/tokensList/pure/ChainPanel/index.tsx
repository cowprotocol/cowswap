import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'

import * as styledEl from './styled'

import { ChainsToSelectState } from '../../types'
import { ChainsSelector } from '../ChainsSelector'

const EMPTY_CHAINS: ChainInfo[] = []

export interface ChainPanelProps {
  title: string
  chainsState: ChainsToSelectState | undefined
  onSelectChain(chain: ChainInfo): void
}

export function ChainPanel({ title, chainsState, onSelectChain }: ChainPanelProps): ReactNode {
  const [chainQuery, setChainQuery] = useState('')
  const [hasVerticalScroll, setHasVerticalScroll] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)
  const normalizedChainQuery = chainQuery.trim().toLowerCase()
  const chains = chainsState?.chains ?? EMPTY_CHAINS
  const isLoading = chainsState?.isLoading ?? false

  const filteredChains = useMemo(() => {
    if (!chains.length || !normalizedChainQuery) {
      return chains
    }

    return chains.filter((chain) => {
      const labelMatch = chain.label.toLowerCase().includes(normalizedChainQuery)
      const idMatch = String(chain.id).includes(normalizedChainQuery)

      return labelMatch || idMatch
    })
  }, [chains, normalizedChainQuery])

  const showSearchEmptyState = !isLoading && filteredChains.length === 0 && !!normalizedChainQuery
  // When bridge networks are unavailable we still render the panel but show the fallback copy
  const showUnavailableState = !isLoading && chains.length === 0 && !normalizedChainQuery

  useEffect(() => {
    const updateScrollState = (): void => {
      const element = listRef.current

      if (!element) {
        return
      }

      const hasScroll = element.scrollHeight - element.clientHeight > 1
      setHasVerticalScroll((current) => (current === hasScroll ? current : hasScroll))
    }

    updateScrollState()

    // ResizeObserver tracks size changes (e.g. viewport height, font scaling) without forcing layout.
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => updateScrollState()) : undefined
    resizeObserver?.observe(listRef.current as Element)

    // MutationObserver lets us react when rows are added/removed so the gutter toggles immediately.
    const mutationObserver =
      typeof MutationObserver !== 'undefined' ? new MutationObserver(() => updateScrollState()) : undefined
    mutationObserver?.observe(listRef.current as Element, { childList: true, subtree: true })

    // Scroll containers can overflow when the viewport height changes (e.g. window resize, soft keyboard).
    window.addEventListener('resize', updateScrollState)

    return () => {
      resizeObserver?.disconnect()
      mutationObserver?.disconnect()
      window.removeEventListener('resize', updateScrollState)
    }
  }, [filteredChains.length, isLoading, normalizedChainQuery])

  return (
    <styledEl.Panel>
      <styledEl.PanelHeader>
        <styledEl.PanelTitle>{title}</styledEl.PanelTitle>
      </styledEl.PanelHeader>
      <styledEl.PanelSearchInputWrapper>
        <styledEl.PanelSearchInput
          value={chainQuery}
          onChange={(event) => setChainQuery(event.target.value)}
          placeholder="Search network"
        />
      </styledEl.PanelSearchInputWrapper>
      <styledEl.PanelList ref={listRef} $hasScrollbar={hasVerticalScroll}>
        <ChainsSelector
          isLoading={isLoading}
          chains={filteredChains}
          defaultChainId={chainsState?.defaultChainId}
          onSelectChain={onSelectChain}
        />
        {showUnavailableState && <styledEl.EmptyState>No networks available for this trade.</styledEl.EmptyState>}
        {showSearchEmptyState && <styledEl.EmptyState>No networks match "{chainQuery}".</styledEl.EmptyState>}
      </styledEl.PanelList>
    </styledEl.Panel>
  )
}

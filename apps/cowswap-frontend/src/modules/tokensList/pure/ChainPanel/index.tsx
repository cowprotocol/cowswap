import { ReactNode, useMemo, useState } from 'react'

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
      <styledEl.PanelList>
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

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

  if (!isLoading && chains.length === 0) {
    return null
  }

  const showEmptyState = !isLoading && filteredChains.length === 0 && !!normalizedChainQuery

  return (
    <styledEl.Panel>
      <styledEl.PanelHeader>
        <styledEl.PanelTitle>{title}</styledEl.PanelTitle>
      </styledEl.PanelHeader>
      <styledEl.PanelSearchInput
        value={chainQuery}
        onChange={(event) => setChainQuery(event.target.value)}
        placeholder="Search network"
      />
      <styledEl.PanelList>
        <ChainsSelector
          isLoading={isLoading}
          chains={filteredChains}
          defaultChainId={chainsState?.defaultChainId}
          onSelectChain={onSelectChain}
        />
        {showEmptyState && <styledEl.EmptyState>No networks match "{chainQuery}".</styledEl.EmptyState>}
      </styledEl.PanelList>
    </styledEl.Panel>
  )
}

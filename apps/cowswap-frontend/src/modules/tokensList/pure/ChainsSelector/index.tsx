import { useState } from 'react'

import { ChainInfo } from '@cowprotocol/types'

import { ChevronDown, ChevronUp } from 'react-feather'

import * as styledEl from './styled'

export interface ChainsSelectorProps {
  chains: ChainInfo[]
  onSelectChain: (chainId: ChainInfo) => void
  defaultChainId?: ChainInfo['id']
  itemsToDisplay?: number
}

// TODO: change default value for itemsToDisplay
export function ChainsSelector({ chains, onSelectChain, defaultChainId, itemsToDisplay = 4 }: ChainsSelectorProps) {
  const [displayMore, setDisplayMore] = useState(false)
  const isDisplayMore = chains.length > itemsToDisplay

  const defaultChain = defaultChainId && chains.find((info) => info.id === defaultChainId)
  const sortedChains = defaultChain ? [defaultChain, ...chains.filter((info) => info.id !== defaultChainId)] : chains
  const chainsToDisplay = displayMore ? sortedChains : sortedChains.slice(0, itemsToDisplay)

  const toggleDisplayMore = () => setDisplayMore((state) => !state)

  return (
    <styledEl.Wrapper>
      {/*TODO: do we need this button?*/}
      {/*<styledEl.ChainButton>*/}
      {/*  <styledEl.TextButton>All</styledEl.TextButton>*/}
      {/*</styledEl.ChainButton>*/}
      {chainsToDisplay.map((chain) => (
        <styledEl.ChainButton key={chain.id} active$={defaultChainId === chain.id} onClick={() => onSelectChain(chain)}>
          <img src={chain.logoUrl} alt={chain.name} />
        </styledEl.ChainButton>
      ))}
      {isDisplayMore && (
        <styledEl.ChainButton>
          <styledEl.TextButton onClick={toggleDisplayMore}>
            {displayMore ? 'Less' : 'More'}
            {displayMore ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </styledEl.TextButton>
        </styledEl.ChainButton>
      )}
    </styledEl.Wrapper>
  )
}

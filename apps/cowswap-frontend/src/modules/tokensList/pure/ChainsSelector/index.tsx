import { ChainInfo } from '@cowprotocol/types'

import { ChevronDown } from 'react-feather'

import * as styledEl from './styled'

export interface ChainsSelectorProps {
  chains: ChainInfo[]
  defaultChainId?: ChainInfo['id']
  onSelectChain: (chainId: ChainInfo) => void
}

export function ChainsSelector({ chains, onSelectChain }: ChainsSelectorProps) {
  return (
    <styledEl.Wrapper>
      <styledEl.ChainButton>
        <styledEl.TextButton>All</styledEl.TextButton>
      </styledEl.ChainButton>
      {chains.map((chain) => (
        <styledEl.ChainButton key={chain.id} onClick={() => onSelectChain(chain)}>
          <img src={chain.logoUrl} alt={chain.name} />
        </styledEl.ChainButton>
      ))}
      <styledEl.ChainButton>
        {/*TODO: add logic to "More"*/}
        <styledEl.TextButton>
          More
          <ChevronDown size={14} />
        </styledEl.TextButton>
      </styledEl.ChainButton>
    </styledEl.Wrapper>
  )
}

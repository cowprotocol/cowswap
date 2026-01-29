import { ReactNode } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'

import { ChainButton } from './ChainButton'
import * as styledEl from './styled'

export interface ChainsListProps {
  chains: ChainInfo[]
  defaultChainId?: ChainInfo['id']
  onSelectChain(chain: ChainInfo): void
  isDarkMode: boolean
  disabledChainIds?: Set<number>
  loadingChainIds?: Set<number>
}

export function ChainsList({
  chains,
  defaultChainId,
  onSelectChain,
  isDarkMode,
  disabledChainIds,
  loadingChainIds,
}: ChainsListProps): ReactNode {
  return (
    <styledEl.List>
      {chains.map((chain) => (
        <ChainButton
          key={chain.id}
          chain={chain}
          isActive={defaultChainId === chain.id}
          onSelectChain={onSelectChain}
          isDarkMode={isDarkMode}
          isDisabled={disabledChainIds?.has(chain.id) ?? false}
          isLoading={loadingChainIds?.has(chain.id) ?? false}
        />
      ))}
    </styledEl.List>
  )
}

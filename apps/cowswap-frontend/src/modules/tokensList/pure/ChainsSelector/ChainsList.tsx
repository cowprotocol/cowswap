import { ReactNode } from 'react'

import { ChainId, ChainInfo } from '@cowprotocol/cow-sdk'

import { ChainButton } from './ChainButton'
import * as styledEl from './styled'

export interface ChainsListProps {
  chains: ChainInfo[]
  defaultChainId?: ChainInfo['id']
  onSelectChain(chain: ChainInfo): void
  isDarkMode: boolean
  disabledChainIds?: Set<ChainId>
  loadingChainIds?: Set<ChainId>
  buildClickEvent?: (chain: ChainInfo) => string
  isSwapMode?: boolean
}

export function ChainsList({
  chains,
  defaultChainId,
  onSelectChain,
  isDarkMode,
  disabledChainIds,
  loadingChainIds,
  buildClickEvent,
  isSwapMode = false,
}: ChainsListProps): ReactNode {
  return (
    <styledEl.List>
      {chains.map((chain) => {
        const isDisabled = disabledChainIds?.has(chain.id) ?? false
        const isLoading = loadingChainIds?.has(chain.id) ?? false
        const clickEvent =
          isSwapMode && buildClickEvent && !isDisabled && !isLoading ? buildClickEvent(chain) : undefined

        return (
          <ChainButton
            key={chain.id}
            chain={chain}
            isActive={defaultChainId === chain.id}
            onSelectChain={onSelectChain}
            isDarkMode={isDarkMode}
            isDisabled={isDisabled}
            isLoading={isLoading}
            clickEvent={clickEvent}
          />
        )
      })}
    </styledEl.List>
  )
}

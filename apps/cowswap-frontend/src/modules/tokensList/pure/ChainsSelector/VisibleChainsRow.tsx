import { ReactNode } from 'react'

import type { ChainInfo } from '@cowprotocol/cow-sdk'
import { HoverTooltip } from '@cowprotocol/ui'

import { ChainLogo } from './ChainLogo'
import * as styledEl from './styled'

interface VisibleChainItemProps {
  chain: ChainInfo
  defaultChainId?: ChainInfo['id']
  buildClickEvent: (chain: ChainInfo) => string
  isSwapMode: boolean
  onSelectChain: (chain: ChainInfo) => void
  isDarkMode: boolean
}

function VisibleChainItem({
  chain,
  defaultChainId,
  buildClickEvent,
  isSwapMode,
  onSelectChain,
  isDarkMode,
}: VisibleChainItemProps): ReactNode {
  const clickEvent = buildClickEvent(chain)

  return (
    <HoverTooltip tooltipCloseDelay={0} wrapInContainer content={chain.label} placement="bottom">
      <styledEl.ChainItem
        active$={defaultChainId === chain.id}
        onClick={() => onSelectChain(chain)}
        iconOnly
        data-click-event={isSwapMode ? clickEvent : undefined}
      >
        <ChainLogo chain={chain} isDarkMode={isDarkMode} alt={chain.label} />
      </styledEl.ChainItem>
    </HoverTooltip>
  )
}

export interface VisibleChainsRowProps {
  visibleChains: ChainInfo[]
  defaultChainId?: ChainInfo['id']
  buildClickEvent: (chain: ChainInfo) => string
  isSwapMode: boolean
  onSelectChain: (chain: ChainInfo) => void
  isDarkMode: boolean
}

export function VisibleChainsRow({
  visibleChains,
  defaultChainId,
  buildClickEvent,
  isSwapMode,
  onSelectChain,
  isDarkMode,
}: VisibleChainsRowProps): ReactNode {
  const chainItems: ReactNode[] = []

  for (const chain of visibleChains) {
    chainItems.push(
      <VisibleChainItem
        key={chain.id}
        chain={chain}
        defaultChainId={defaultChainId}
        buildClickEvent={buildClickEvent}
        isSwapMode={isSwapMode}
        onSelectChain={onSelectChain}
        isDarkMode={isDarkMode}
      />,
    )
  }

  return chainItems
}

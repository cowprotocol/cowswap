/**
 * ChainSelector Slot - Mobile chain selection chip and panel
 */
import { ReactNode } from 'react'

import { ChainPanel } from '../../../../pure/ChainPanel'
import { MobileChainSelector } from '../../../../pure/SelectTokenModal/MobileChainSelector'
import { MobileChainPanelPortal } from '../../MobileChainPanelPortal'
import { useChainState } from '../store'

export function ChainSelector(): ReactNode {
  const chain = useChainState()

  if (!chain.isEnabled) {
    return null
  }

  // Only show mobile chain selector on compact layout
  if (!chain.isCompactLayout || !chain.mobileChainsState) {
    return null
  }

  return (
    <>
      <MobileChainSelector
        chainsState={chain.mobileChainsState}
        label={chain.title}
        onSelectChain={chain.onSelectChain}
        onOpenPanel={chain.onOpenMobileChainPanel}
      />

      {chain.isMobileChainPanelOpen && chain.chainsToSelect && (
        <MobileChainPanelPortal
          chainsPanelTitle={chain.title}
          chainsToSelect={chain.chainsToSelect}
          onSelectChain={chain.onSelectChain}
          onClose={chain.onCloseMobileChainPanel}
        />
      )}
    </>
  )
}

export function DesktopChainPanel(): ReactNode {
  const chain = useChainState()

  if (!chain.isEnabled || !chain.isVisible || !chain.chainsToSelect) {
    return null
  }

  return <ChainPanel title={chain.title} chainsState={chain.chainsToSelect} onSelectChain={chain.onSelectChain} />
}

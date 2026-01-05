import { ReactNode } from 'react'

import { ChainPanel } from '../../../pure/ChainPanel'
import { MobileChainSelector } from '../../../pure/SelectTokenModal/MobileChainSelector'
import { useChainState } from '../hooks'
import { MobileChainPanelPortal } from '../MobileChainPanelPortal'

/**
 * SelectTokenWidget.ChainSelector - Handles mobile chain selection.
 * Uses useChainState hook that combines atoms + context.
 */
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
      {/* Mobile inline chain chip selector */}
      <MobileChainSelector
        chainsState={chain.mobileChainsState}
        label={chain.title}
        onSelectChain={chain.onSelectChain}
        onOpenPanel={chain.onOpenMobileChainPanel}
      />

      {/* Mobile chain panel portal - full screen panel */}
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

/**
 * SelectTokenWidget.DesktopChainPanel - Side panel for desktop chain selection.
 * Rendered outside the modal container.
 */
export function DesktopChainPanel(): ReactNode {
  const chain = useChainState()

  if (!chain.isEnabled || !chain.isVisible || !chain.chainsToSelect) {
    return null
  }

  return <ChainPanel title={chain.title} chainsState={chain.chainsToSelect} onSelectChain={chain.onSelectChain} />
}

/**
 * ChainSelector Slot - Mobile chain selection chip and panel
 *
 * Manages mobile panel visibility internally.
 * Only needs chains data and onSelectChain callback from parent.
 */
import { ReactNode, useState, useCallback } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { Media } from '@cowprotocol/ui'

import { ChainPanel } from '../../../../pure/ChainPanel'
import { MobileChainSelector } from '../../../../pure/SelectTokenModal/MobileChainSelector'
import { ChainsToSelectState } from '../../../../types'
import { MobileChainPanelPortal } from '../../MobileChainPanelPortal'

export interface ChainSelectorProps {
  chains?: ChainsToSelectState
  title?: string
  onSelectChain: (chain: ChainInfo) => void
}

export function ChainSelector({ chains, title = 'Select network', onSelectChain }: ChainSelectorProps): ReactNode {
  const [isMobilePanelOpen, setMobilePanelOpen] = useState(false)
  const isCompactLayout = useMediaQuery(Media.upToMedium(false))

  const openPanel = useCallback(() => setMobilePanelOpen(true), [])
  const closePanel = useCallback(() => setMobilePanelOpen(false), [])

  const handleSelectChain = useCallback(
    (chain: ChainInfo) => {
      onSelectChain(chain)
      closePanel()
    },
    [onSelectChain, closePanel],
  )

  // Only show on mobile/compact layout
  if (!isCompactLayout || !chains) {
    return null
  }

  return (
    <>
      <MobileChainSelector
        chainsState={chains}
        label={title}
        onSelectChain={handleSelectChain}
        onOpenPanel={openPanel}
      />

      {isMobilePanelOpen && (
        <MobileChainPanelPortal
          chainsPanelTitle={title}
          chainsToSelect={chains}
          onSelectChain={handleSelectChain}
          onClose={closePanel}
        />
      )}
    </>
  )
}

export interface DesktopChainPanelProps {
  chains?: ChainsToSelectState
  title?: string
  onSelectChain: (chain: ChainInfo) => void
}

export function DesktopChainPanel({
  chains,
  title = 'Select network',
  onSelectChain,
}: DesktopChainPanelProps): ReactNode {
  const isCompactLayout = useMediaQuery(Media.upToMedium(false))

  // Only show on desktop (not compact layout)
  if (isCompactLayout || !chains) {
    return null
  }

  return <ChainPanel title={title} chainsState={chains} onSelectChain={onSelectChain} />
}

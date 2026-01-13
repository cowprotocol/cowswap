import { ReactNode, useState, useCallback } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { Media } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { MobileChainSelector } from '../../../../pure/SelectTokenModal/MobileChainSelector'
import { ChainsToSelectState } from '../../../../types'
import { MobileChainPanelPortal } from '../../MobileChainPanelPortal'

export interface ChainSelectorProps {
  chains?: ChainsToSelectState
  title?: string
  onSelectChain: (chain: ChainInfo) => void
}

export function ChainSelector({ chains, title, onSelectChain }: ChainSelectorProps): ReactNode {
  const resolvedTitle = title ?? t`Select network`
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

  if (!isCompactLayout || !chains) {
    return null
  }

  return (
    <>
      <MobileChainSelector
        chainsState={chains}
        label={resolvedTitle}
        onSelectChain={handleSelectChain}
        onOpenPanel={openPanel}
      />

      {isMobilePanelOpen && (
        <MobileChainPanelPortal
          chainsPanelTitle={resolvedTitle}
          chainsToSelect={chains}
          onSelectChain={handleSelectChain}
          onClose={closePanel}
        />
      )}
    </>
  )
}

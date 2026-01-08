import { MouseEvent, ReactNode } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'

import { createPortal } from 'react-dom'

import { MobileChainPanelCard, MobileChainPanelOverlay } from './styled'

import { ChainPanel } from '../../pure/ChainPanel'
import { ChainsToSelectState } from '../../types'

interface MobileChainPanelPortalProps {
  chainsPanelTitle: string
  chainsToSelect: ChainsToSelectState | undefined
  onSelectChain: (chain: ChainInfo) => void
  onClose(): void
}

export function MobileChainPanelPortal({
  chainsPanelTitle,
  chainsToSelect,
  onSelectChain,
  onClose,
}: MobileChainPanelPortalProps): ReactNode {
  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <MobileChainPanelOverlay onClick={onClose}>
      <MobileChainPanelCard onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}>
        <ChainPanel
          title={chainsPanelTitle}
          chainsState={chainsToSelect}
          onSelectChain={(chain) => {
            onSelectChain(chain)
            onClose()
          }}
          variant="fullscreen"
          onClose={onClose}
        />
      </MobileChainPanelCard>
    </MobileChainPanelOverlay>,
    document.body,
  )
}

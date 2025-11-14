import { ReactNode } from 'react'

import { createPortal } from 'react-dom'

import { MobileChainPanelCard, MobileChainPanelOverlay } from './styled'

import { ChainPanel } from '../../pure/ChainPanel'

import type { SelectTokenWidgetViewProps } from './controllerProps'

export function renderMobileChainPanel({
  chainsPanelTitle,
  chainsToSelect,
  onSelectChain,
  onClose,
}: {
  chainsPanelTitle: string
  chainsToSelect: SelectTokenWidgetViewProps['chainsToSelect']
  onSelectChain: SelectTokenWidgetViewProps['onSelectChain']
  onClose(): void
}): ReactNode {
  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <MobileChainPanelOverlay onClick={onClose}>
      <MobileChainPanelCard onClick={(event) => event.stopPropagation()}>
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

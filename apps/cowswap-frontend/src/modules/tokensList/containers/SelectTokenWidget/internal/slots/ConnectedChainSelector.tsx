import { ReactNode } from 'react'

import { ChainSelector } from './ChainSelector'

import { useSelectTokenWidgetState } from '../../../../hooks/useSelectTokenWidgetState'
import { useChainPanelState } from '../../hooks'

export function ConnectedChainSelector(): ReactNode {
  const widgetState = useSelectTokenWidgetState()
  const chainPanel = useChainPanelState(widgetState.tradeType)

  if (!chainPanel.isEnabled) return null

  return <ChainSelector chains={chainPanel.chainsToSelect} onSelectChain={chainPanel.onSelectChain} />
}

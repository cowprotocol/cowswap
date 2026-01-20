import { ReactNode } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { DesktopChainPanel } from './DesktopChainPanel'

import { useSelectTokenWidgetState } from '../../../../hooks/useSelectTokenWidgetState'
import { useChainPanelState } from '../../hooks'

export function ConnectedDesktopChainPanel(): ReactNode {
  const widgetState = useSelectTokenWidgetState()
  const chainPanel = useChainPanelState(widgetState.tradeType)
  const isCompactLayout = useMediaQuery(Media.upToMedium(false))

  if (!chainPanel.isEnabled || isCompactLayout) return null

  return <DesktopChainPanel chains={chainPanel.chainsToSelect} onSelectChain={chainPanel.onSelectChain} />
}

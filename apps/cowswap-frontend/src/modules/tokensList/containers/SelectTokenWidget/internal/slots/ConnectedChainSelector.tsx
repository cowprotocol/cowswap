import { ReactNode } from 'react'

import { ChainSelector } from './ChainSelector'

import { useSelectTokenWidgetState } from '../../../../hooks/useSelectTokenWidgetState'
import { useChainAnalyticsContext, useChainPanelState } from '../../hooks'

export function ConnectedChainSelector(): ReactNode {
  const widgetState = useSelectTokenWidgetState()
  const chainPanel = useChainPanelState(widgetState.tradeType)
  const analyticsContext = useChainAnalyticsContext()

  if (!chainPanel.isEnabled) return null

  return (
    <ChainSelector
      chains={chainPanel.chainsToSelect}
      onSelectChain={chainPanel.onSelectChain}
      tradeType={analyticsContext.tradeType}
      field={analyticsContext.field}
      counterChainId={analyticsContext.counterChainId}
    />
  )
}

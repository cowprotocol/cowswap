/**
 * useChainPanelState - Chain panel visibility and handlers
 */
import { useMemo } from 'react'

import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'

import { TradeType } from 'modules/trade'

import { useChainsToSelect } from '../../../hooks/useChainsToSelect'
import { useOnSelectChain } from '../../../hooks/useOnSelectChain'
import { ChainsToSelectState } from '../../../types'

// TODO: Re-enable once Yield should support cross-network selection in the modal
const ENABLE_YIELD_CHAIN_PANEL = false

export interface ChainPanelState {
  isEnabled: boolean
  chainsToSelect: ChainsToSelectState | undefined
  onSelectChain: (chain: ChainInfo) => void
}

export function useChainPanelState(tradeType: TradeType | undefined): ChainPanelState {
  const chainsToSelect = useChainsToSelect()
  const onSelectChain = useOnSelectChain()
  const isBridgeFeatureEnabled = useIsBridgingEnabled()

  const shouldDisableForYield = tradeType === TradeType.YIELD && !ENABLE_YIELD_CHAIN_PANEL
  const isEnabled = isBridgeFeatureEnabled && Boolean(chainsToSelect?.chains?.length) && !shouldDisableForYield

  return useMemo(
    () => ({
      isEnabled,
      chainsToSelect,
      onSelectChain,
    }),
    [isEnabled, chainsToSelect, onSelectChain],
  )
}

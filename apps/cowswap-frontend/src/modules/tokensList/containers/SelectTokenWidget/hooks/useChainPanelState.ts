/**
 * useChainPanelState - Chain panel visibility and handlers
 */
import { useMemo } from 'react'

import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { useNetworkSwitchUnsupported } from '@cowprotocol/wallet'

import { Field } from 'legacy/state/types'

import { TradeType } from 'common/modules/tradeNavigation'

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

export function useChainPanelState(tradeType: TradeType | undefined, field?: Field): ChainPanelState {
  const chainsToSelect = useChainsToSelect()
  const onSelectChain = useOnSelectChain()
  const isBridgeFeatureEnabled = useIsBridgingEnabled()
  // Hide the sell (INPUT) network panel only for wallets locked to a single chain (e.g. Safe app / Safe via WC),
  // consistently with the main network selector. Notably Rabby (even with a Safe imported) is not locked.
  const shouldHideNetworkSelector = useNetworkSwitchUnsupported()

  const shouldDisableForYield = tradeType === TradeType.YIELD && !ENABLE_YIELD_CHAIN_PANEL
  const shouldDisableForSellField = field === Field.INPUT && shouldHideNetworkSelector

  const isEnabled =
    !shouldDisableForSellField &&
    isBridgeFeatureEnabled &&
    Boolean(chainsToSelect?.chains?.length) &&
    !shouldDisableForYield

  return useMemo(
    () => ({
      isEnabled,
      chainsToSelect,
      onSelectChain,
    }),
    [isEnabled, chainsToSelect, onSelectChain],
  )
}

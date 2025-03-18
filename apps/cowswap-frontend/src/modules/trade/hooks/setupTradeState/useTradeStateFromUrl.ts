import { useAtomValue } from 'jotai'

import { tradeStateFromUrlAtom } from '../../state/tradeStateFromUrlAtom'
import { TradeRawState } from '../../types/TradeRawState'

/**
 * Get trade state from URL params and query
 * /1/swap/WETH/DAI?recipient=0x -> { chainId: 1, inputCurrencyId: 'WETH', outputCurrencyId: 'DAI', recipient: '0x' }
 */
export function useTradeStateFromUrl(): TradeRawState | null {
  return useAtomValue(tradeStateFromUrlAtom)
}

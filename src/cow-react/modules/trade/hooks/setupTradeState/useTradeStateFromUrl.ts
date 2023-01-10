import { useLocation, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { TradeState, TradeStateFromUrl } from '../../types/TradeState'

/**
 * Get trade state from URL params and query
 * /1/swap/WETH/DAI?recipient=0x -> { chainId: 1, inputCurrencyId: 'WETH', outputCurrencyId: 'DAI', recipient: '0x' }
 */
export function useTradeStateFromUrl(): TradeState {
  const params = useParams()
  const location = useLocation()

  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    const recipient = searchParams.get('recipient')
    const { chainId, inputCurrencyId, outputCurrencyId } = params as TradeStateFromUrl
    const chainIdAsNumber = chainId && /^\d+$/.test(chainId) ? parseInt(chainId) : null

    const state: TradeState = {
      chainId: chainIdAsNumber,
      inputCurrencyId: inputCurrencyId || searchParams.get('inputCurrency') || null,
      outputCurrencyId: outputCurrencyId || searchParams.get('outputCurrency') || null,
      recipient,
    }

    return state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, JSON.stringify(params)])
}

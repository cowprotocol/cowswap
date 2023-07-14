import { useMemo } from 'react'

import { useLocation, useParams } from 'react-router-dom'

import { TradeRawState } from '../../types/TradeRawState'

/**
 * Get trade state from URL params and query
 * /1/swap/WETH/DAI?recipient=0x -> { chainId: 1, inputCurrencyId: 'WETH', outputCurrencyId: 'DAI', recipient: '0x' }
 */
export function useTradeStateFromUrl(): TradeRawState {
  const params = useParams()
  const location = useLocation()

  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    const recipient = searchParams.get('recipient')
    const recipientAddress = searchParams.get('recipientAddress')
    const { chainId, inputCurrencyId, outputCurrencyId } = params
    const chainIdAsNumber = chainId && /^\d+$/.test(chainId) ? parseInt(chainId) : null

    const state: TradeRawState = {
      chainId: chainIdAsNumber,
      inputCurrencyId: inputCurrencyId || searchParams.get('inputCurrency') || null,
      outputCurrencyId: outputCurrencyId || searchParams.get('outputCurrency') || null,
      recipient,
      recipientAddress,
    }

    return state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, JSON.stringify(params)])
}

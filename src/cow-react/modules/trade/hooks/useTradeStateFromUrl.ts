import { useLocation, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { TradeState } from '../types/TradeState'

interface TradeStateFromUrl {
  readonly chainId: string | undefined
  readonly inputCurrencyId: string | undefined
  readonly outputCurrencyId: string | undefined
}

export function useTradeStateFromUrl(): TradeState {
  const params = useParams()
  const location = useLocation()

  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    const recipient = searchParams.get('recipient')
    const { chainId, inputCurrencyId, outputCurrencyId } = params as TradeStateFromUrl
    const chainIdAsNumber = chainId ? parseInt(chainId) : null

    return {
      chainId: chainIdAsNumber,
      inputCurrencyId: inputCurrencyId || null,
      outputCurrencyId: outputCurrencyId || null,
      recipient,
    }
  }, [location.search, params])
}

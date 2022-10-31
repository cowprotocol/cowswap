import { useLocation, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { OrderKind } from '@cowprotocol/contracts'
import { LimitOrdersState } from '../state/limitOrdersAtom'

interface LimitOrdersStateFromUrl {
  readonly chainId: string | undefined
  readonly inputCurrencyId: string | undefined
  readonly outputCurrencyId: string | undefined
}

export function useLimitOrdersStateFromUrl(): LimitOrdersState {
  const params = useParams()
  const location = useLocation()

  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    const recipient = searchParams.get('recipient')
    const { chainId, inputCurrencyId, outputCurrencyId } = params as LimitOrdersStateFromUrl
    const chainIdAsNumber = chainId ? parseInt(chainId) : null
    const orderKind = OrderKind.SELL

    return {
      chainId: chainIdAsNumber,
      deadline: null,
      inputCurrencyAmount: null,
      outputCurrencyAmount: null,
      inputCurrencyId: inputCurrencyId || null,
      outputCurrencyId: outputCurrencyId || null,
      recipient,
      orderKind,
    }
  }, [location.search, params])
}

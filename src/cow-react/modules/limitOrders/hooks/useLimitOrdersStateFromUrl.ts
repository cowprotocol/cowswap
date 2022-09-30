import { useLocation, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { getDefaultLimitOrdersState, LimitOrdersState } from 'cow-react/modules/limitOrders/state/limitOrdersAtom'
import { useWeb3React } from '@web3-react/core'

interface LimitOrdersStateFromUrl {
  readonly chainId: string | undefined
  readonly inputCurrencyId: string | undefined
  readonly outputCurrencyId: string | undefined
}

export function useLimitOrdersStateFromUrl(): LimitOrdersState {
  const { chainId: currentChainId } = useWeb3React()
  const params = useParams()
  const location = useLocation()

  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    const recipient = searchParams.get('recipient')
    const { chainId, inputCurrencyId, outputCurrencyId } = params as LimitOrdersStateFromUrl
    const chainIdAsNumber = chainId ? parseInt(chainId) : null

    if (currentChainId && currentChainId !== chainIdAsNumber) {
      return getDefaultLimitOrdersState(currentChainId)
    }

    return {
      chainId: chainIdAsNumber,
      inputCurrencyAmount: null,
      outputCurrencyAmount: null,
      inputCurrencyId: inputCurrencyId || null,
      outputCurrencyId: outputCurrencyId || null,
      recipient,
    }
  }, [location.search, params, currentChainId])
}

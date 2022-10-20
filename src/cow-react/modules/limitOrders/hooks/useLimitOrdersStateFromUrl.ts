import { useLocation, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { getDefaultLimitOrdersState, LimitOrdersState } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { useWeb3React } from '@web3-react/core'
import { OrderKind } from '@cowprotocol/contracts'

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
    const orderKind = OrderKind.SELL

    if (currentChainId && currentChainId !== chainIdAsNumber) {
      return getDefaultLimitOrdersState(currentChainId)
    }

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
  }, [location.search, params, currentChainId])
}

import { useEffect } from 'react'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useWeb3React } from '@web3-react/core'
import { OrderKind } from '@cowprotocol/contracts'

import usePrevious from 'hooks/usePrevious'
import { useUpdateCurrencyAmount } from '@cow/modules/limitOrders/hooks/useUpdateCurrencyAmount'
import { limitRateAtom, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { updateLimitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'

// Observe the activeRate value changes
export function ActiveRateUpdater() {
  const { chainId } = useWeb3React()
  const { orderKind, ...limitState } = useLimitOrdersTradeState()
  const { isInversed, activeRate, isLoading } = useAtomValue(limitRateAtom)

  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const prevIsInversed = usePrevious(isInversed)
  const prevChainId = usePrevious(chainId)

  useEffect(() => {
    // Handle active rate change
    if (isInversed === prevIsInversed && activeRate) {
      const field = orderKind === OrderKind.SELL ? 'inputCurrencyAmount' : 'outputCurrencyAmount'

      updateCurrencyAmount({
        [field]: limitState[field]?.toExact(),
        keepOrderKind: true,
      })
    }

    // Clear input/output amount based on the orderKind, when there is no active rate
    if (!activeRate) {
      const field = orderKind === OrderKind.SELL ? 'outputCurrencyAmount' : 'inputCurrencyAmount'

      updateLimitOrdersState({
        [field]: null,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRate])

  useEffect(() => {
    // Clear active rate on network change
    if (prevChainId && prevChainId !== chainId) {
      updateLimitRateState({ activeRate: null })
    }

    // Clear active rate when its loading (currency changed)
    if (isLoading) {
      updateLimitRateState({ activeRate: null })
    }
  }, [chainId, isLoading, prevChainId, updateLimitRateState])

  return null
}

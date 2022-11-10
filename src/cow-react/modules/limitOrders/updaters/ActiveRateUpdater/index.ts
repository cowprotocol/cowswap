import { useEffect } from 'react'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useWeb3React } from '@web3-react/core'

import usePrevious from 'hooks/usePrevious'
import { useUpdateCurrencyAmount } from '@cow/modules/limitOrders/hooks/useUpdateCurrencyAmount'
import { limitRateAtom, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { updateLimitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'

// Observe the activeRate value changes
// Re-trigger the input field to apply the new rate to output
export function ActiveRateUpdater() {
  const { chainId } = useWeb3React()
  const { inputCurrencyAmount } = useLimitOrdersTradeState()
  const { isInversed, activeRate, isLoading } = useAtomValue(limitRateAtom)

  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const prevIsInversed = usePrevious(isInversed)
  const prevChainId = usePrevious(chainId)

  useEffect(() => {
    // Handle active rate change
    if (isInversed === prevIsInversed && activeRate && inputCurrencyAmount) {
      updateCurrencyAmount({
        inputCurrencyAmount: inputCurrencyAmount?.toExact(),
        keepOrderKind: true,
      })
    }

    // Clear output amount when there is no active rate
    if (!activeRate) {
      updateLimitOrdersState({
        outputCurrencyAmount: null,
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

import { useEffect } from 'react'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useWeb3React } from '@web3-react/core'

import usePrevious from 'hooks/usePrevious'
import { useUpdateCurrencyAmount } from '@cow/modules/limitOrders/hooks/useUpdateCurrencyAmount'
import { limitRateAtom, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'

// Observe the activeRate value changes
// Re-trigger the input field to apply the new rate to output
export function ActiveRateUpdater() {
  const { chainId } = useWeb3React()
  const { inputCurrencyAmount } = useLimitOrdersTradeState()
  const { isInversed, activeRate } = useAtomValue(limitRateAtom)

  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const prevIsInversed = usePrevious(isInversed)
  const prevChainId = usePrevious(chainId)

  // Handle activeRate changes
  useEffect(() => {
    if (isInversed === prevIsInversed && activeRate && inputCurrencyAmount) {
      updateCurrencyAmount({
        inputCurrencyAmount: inputCurrencyAmount?.toExact(),
        keepOrderKind: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRate])

  // Clear active rate on network change
  useEffect(() => {
    if (prevChainId && prevChainId !== chainId) {
      updateLimitRateState({ activeRate: null })
    }
  }, [chainId, prevChainId, updateLimitRateState])

  return null
}

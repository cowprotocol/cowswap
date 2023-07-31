import { useMemo } from 'react'

import { useTradeState } from './useTradeState'
import { useWalletInfo } from '../../wallet'

import { getIsWrapOrUnwrap } from '../../../utils/getIsWrapOrUnwrap'

export function useIsWrapOrUnwrap(): boolean {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { inputCurrencyId, outputCurrencyId } = state || {}

  return useMemo(() => {
    return getIsWrapOrUnwrap(chainId, inputCurrencyId, outputCurrencyId)
  }, [chainId, inputCurrencyId, outputCurrencyId])
}

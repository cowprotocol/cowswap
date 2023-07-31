import { useMemo } from 'react'

import { useTradeState } from 'modules/trade/hooks/useTradeState'
import { useWalletInfo } from 'modules/wallet'

import { getIsWrapOrUnwrap } from 'utils/getIsWrapOrUnwrap'

export function useIsWrapOrUnwrap(): boolean {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { inputCurrencyId, outputCurrencyId } = state || {}

  return useMemo(() => {
    return getIsWrapOrUnwrap(chainId, inputCurrencyId, outputCurrencyId)
  }, [chainId, inputCurrencyId, outputCurrencyId])
}

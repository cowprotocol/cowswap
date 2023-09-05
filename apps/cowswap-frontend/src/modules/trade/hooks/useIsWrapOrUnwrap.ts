import { useMemo } from 'react'

import { getIsWrapOrUnwrap } from '@cowswap/common-utils'
import { useWalletInfo } from '@cowswap/wallet'

import { useTradeState } from 'modules/trade/hooks/useTradeState'

export function useIsWrapOrUnwrap(): boolean {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { inputCurrencyId, outputCurrencyId } = state || {}

  return useMemo(() => {
    return getIsWrapOrUnwrap(chainId, inputCurrencyId, outputCurrencyId)
  }, [chainId, inputCurrencyId, outputCurrencyId])
}

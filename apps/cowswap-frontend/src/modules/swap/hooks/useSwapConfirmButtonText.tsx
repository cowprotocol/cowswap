import { useMemo } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'

import { useIsSafeEthFlow } from './useIsSafeEthFlow'

export function useSwapConfirmButtonText(slippageAdjustedSellAmount: Nullish<CurrencyAmount<Currency>>) {
  const isSafeApprovalBundle = useIsSafeApprovalBundle(slippageAdjustedSellAmount)
  const isSafeEthFlowBundle = useIsSafeEthFlow()
  const sellCurrency = slippageAdjustedSellAmount?.currency

  return useMemo(() => {
    if (isSafeEthFlowBundle) {
      return (
        <>
          Confirm (Wrap&nbsp;{<TokenSymbol token={sellCurrency} length={6} />}
          &nbsp;and Swap)
        </>
      )
    }
    if (isSafeApprovalBundle) {
      return (
        <>
          Confirm (Approve&nbsp;{<TokenSymbol token={sellCurrency && getWrappedToken(sellCurrency)} length={6} />}
          &nbsp;and Swap)
        </>
      )
    }
    return 'Confirm Swap'
  }, [isSafeApprovalBundle, isSafeEthFlowBundle, sellCurrency])
}

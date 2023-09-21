import { useMemo } from 'react'

import { TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useIsSafeApprovalBundle } from 'modules/limitOrders/hooks/useIsSafeApprovalBundle'
import { useIsSafeEthFlow } from 'modules/swap/hooks/useIsSafeEthFlow'

export function useButtonText(slippageAdjustedSellAmount: Nullish<CurrencyAmount<Currency>>) {
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
    } else if (isSafeApprovalBundle) {
      return (
        <>
          Confirm (Approve&nbsp;{<TokenSymbol token={sellCurrency?.wrapped} length={6} />}
          &nbsp;and Swap)
        </>
      )
    } else {
      return undefined
    }
  }, [isSafeApprovalBundle, isSafeEthFlowBundle, sellCurrency])
}

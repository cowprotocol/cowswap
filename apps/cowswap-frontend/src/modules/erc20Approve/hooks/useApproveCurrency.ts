import { useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useShouldZeroApprove, useZeroApprove } from 'modules/zeroApproval'

import { useTradeApproveCallback } from 'common/containers/TradeApprove'


// TODO: allocate a module for all approval process logic
// TODO: Add proper return type annotation
export function useApproveCurrency(
  amountToApprove: CurrencyAmount<Currency> | undefined,
): (() => Promise<void>) | undefined {
  const tradeApproveCallback = useTradeApproveCallback(amountToApprove)
  const shouldZeroApprove = useShouldZeroApprove(amountToApprove)
  const zeroApprove = useZeroApprove(amountToApprove?.currency)
  const callback = useCallback(async () => {
    if (shouldZeroApprove) {
      await zeroApprove()
    }

    await tradeApproveCallback()
  }, [tradeApproveCallback, zeroApprove, shouldZeroApprove])

  if (shouldZeroApprove === null) return undefined

  return callback
}

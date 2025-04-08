import { useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useShouldZeroApprove, useZeroApprove } from 'modules/erc20Approval'

import { useTradeApproveCallback } from 'common/containers/TradeApprove'

export function useApproveCurrency(amountToApprove: CurrencyAmount<Currency> | undefined) {
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

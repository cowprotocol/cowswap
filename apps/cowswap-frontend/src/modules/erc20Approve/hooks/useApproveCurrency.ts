import { useCallback } from 'react'

import { Nullish } from '@cowprotocol/types'
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { TradeApproveResult, useTradeApproveCallback } from 'modules/erc20Approve'
import { useShouldZeroApprove, useZeroApprove } from 'modules/zeroApproval'

export function useApproveCurrency(
  amountToApprove: CurrencyAmount<Currency> | undefined,
  useModals = true,
): (amount: bigint) => Promise<Nullish<TradeApproveResult | SafeMultisigTransactionResponse>> {
  const currency = amountToApprove?.currency

  const tradeApproveCallback = useTradeApproveCallback(currency)
  const shouldZeroApprove = useShouldZeroApprove(amountToApprove, true)
  const zeroApprove = useZeroApprove(currency)

  return useCallback(
    async (amount: bigint) => {
      if (await shouldZeroApprove()) {
        await zeroApprove()
      }

      return tradeApproveCallback(amount, { useModals, waitForTxConfirmation: true })
    },
    [useModals, tradeApproveCallback, zeroApprove, shouldZeroApprove],
  )
}

import { useCallback } from 'react'

import { Nullish } from '@cowprotocol/types'
import type { SafeMultisigTransactionResponse } from '@safe-global/types-kit'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { GenerecTradeApproveResult, useTradeApproveCallback } from 'modules/erc20Approve'
import { useShouldZeroApprove, useZeroApprove } from 'modules/zeroApproval'

export function useApproveCurrency(
  amountToApprove: CurrencyAmount<Currency> | undefined,
  useModals = true,
): (amount: bigint) => Promise<Nullish<GenerecTradeApproveResult | SafeMultisigTransactionResponse>> {
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

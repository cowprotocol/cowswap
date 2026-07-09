import { useCallback } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { Nullish } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import type { SafeMultisigTransactionResponse } from '@safe-global/types-kit'

import { GenerecTradeApproveResult, useTradeApproveCallback } from 'modules/erc20Approve'
import { callOnBeforeApprovalWidgetHook } from 'modules/injectedWidget'
import { useShouldZeroApprove, useZeroApprove } from 'modules/zeroApproval'

export type ApproveCurrencyCallback = (
  amount: bigint,
) => Promise<Nullish<GenerecTradeApproveResult | SafeMultisigTransactionResponse>>

export function useApproveCurrency(
  amountToApprove: CurrencyAmount<Currency> | undefined,
  useModals = true,
): ApproveCurrencyCallback {
  const currency = amountToApprove?.currency

  const { account } = useWalletInfo()
  const tradeSpenderAddress = useTradeSpenderAddress()
  const tradeApproveCallback = useTradeApproveCallback(currency)
  const shouldZeroApprove = useShouldZeroApprove(amountToApprove, true)
  const zeroApprove = useZeroApprove(currency)

  return useCallback(
    async (amount: bigint) => {
      if (!account || !tradeSpenderAddress || !amountToApprove) return null

      const isWidgetHookPassed = await callOnBeforeApprovalWidgetHook({
        account,
        amountToApprove,
        spenderAddress: tradeSpenderAddress,
        approvalAmount: amount,
      })

      if (!isWidgetHookPassed) return null

      if (await shouldZeroApprove()) {
        await zeroApprove()
      }

      return tradeApproveCallback(amount, { useModals, waitForTxConfirmation: true })
    },
    [account, tradeSpenderAddress, amountToApprove, useModals, tradeApproveCallback, zeroApprove, shouldZeroApprove],
  )
}

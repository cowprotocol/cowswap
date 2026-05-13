import { useCallback } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { currencyAmountToTokenAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { Nullish } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { WidgetHookEvents } from '@cowprotocol/widget-lib'
import type { SafeMultisigTransactionResponse } from '@safe-global/types-kit'

import { GenerecTradeApproveResult, useTradeApproveCallback } from 'modules/erc20Approve'
import { callWidgetHook } from 'modules/injectedWidget'
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

      const tokenAmount = currencyAmountToTokenAmount(amountToApprove)
      const isWidgetHookPassed = await callWidgetHook(WidgetHookEvents.ON_BEFORE_APPROVAL, {
        chainId: tokenAmount.currency.chainId,
        sellToken: {
          ...tokenAmount.currency,
          name: tokenAmount.currency.name || '',
          symbol: tokenAmount.currency.symbol || '',
        },
        sellAmount: amount.toString(),
        walletAddress: account,
        spenderAddress: tradeSpenderAddress,
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

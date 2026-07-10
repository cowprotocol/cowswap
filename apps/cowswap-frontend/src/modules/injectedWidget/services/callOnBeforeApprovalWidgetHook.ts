import { currencyAmountToTokenAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { WidgetHookEvents } from '@cowprotocol/widget-lib'

import { callWidgetHook } from './callWidgetHook'

interface CallOnBeforeApprovalWidgetHookParams {
  amountToApprove: CurrencyAmount<Currency>
  account: string
  spenderAddress: string
  approvalAmount?: bigint
}

export function callOnBeforeApprovalWidgetHook({
  amountToApprove,
  account,
  spenderAddress,
  approvalAmount,
}: CallOnBeforeApprovalWidgetHookParams): Promise<boolean> {
  const tokenAmount = currencyAmountToTokenAmount(amountToApprove)

  return callWidgetHook(WidgetHookEvents.ON_BEFORE_APPROVAL, {
    chainId: tokenAmount.currency.chainId,
    sellToken: {
      ...tokenAmount.currency,
      name: tokenAmount.currency.name || '',
      symbol: tokenAmount.currency.symbol || '',
    },
    sellAmount: (approvalAmount ?? BigInt(amountToApprove.quotient.toString())).toString(),
    walletAddress: account,
    spenderAddress,
  })
}

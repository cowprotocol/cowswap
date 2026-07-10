import { Currency, CurrencyAmount } from '@cowprotocol/currency'

interface GetEthFlowCurrencyToApproveParams {
  amountSetByUser: CurrencyAmount<Currency> | undefined
  isPartialApproveSelectedByUser: boolean
  wrappedAmount: CurrencyAmount<Currency> | null
}

export function getEthFlowCurrencyToApprove({
  amountSetByUser,
  isPartialApproveSelectedByUser,
  wrappedAmount,
}: GetEthFlowCurrencyToApproveParams): CurrencyAmount<Currency> | undefined {
  if (!isPartialApproveSelectedByUser) return undefined
  if (!wrappedAmount) return undefined
  if (!amountSetByUser) return wrappedAmount

  return amountSetByUser.currency.equals(wrappedAmount.currency) ? amountSetByUser : wrappedAmount
}

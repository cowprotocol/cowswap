import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'
import { useApproveState } from 'common/hooks/useApproveState'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { ApprovalState } from 'legacy/hooks/useApproveCallback'

export function useTradeApproveState(amountToApprove: CurrencyAmount<Currency> | null): ApprovalState {
  const spender = useTradeSpenderAddress()

  return useApproveState(amountToApprove, spender)
}

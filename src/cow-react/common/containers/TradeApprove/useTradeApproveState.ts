import { useTradeSpenderAddress } from '@cow/common/hooks/useTradeSpenderAddress'
import { useApproveState } from '@cow/common/hooks/useApproveState'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { ApprovalState } from 'hooks/useApproveCallback'

export function useTradeApproveState(amountToApprove: CurrencyAmount<Currency> | null): ApprovalState {
  const spender = useTradeSpenderAddress()

  return useApproveState(amountToApprove, spender)
}

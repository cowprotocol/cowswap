import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { ApprovalState } from 'legacy/hooks/useApproveCallback'

import { useApproveState } from 'common/hooks/useApproveState'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'

export function useTradeApproveState(amountToApprove: CurrencyAmount<Currency> | null): ApprovalState {
  const spender = useTradeSpenderAddress()

  return useApproveState(amountToApprove, spender)
}

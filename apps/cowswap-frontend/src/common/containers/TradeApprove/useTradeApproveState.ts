import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ApprovalState } from 'legacy/hooks/useApproveCallback/useApproveCallbackMod'

import { useApproveState } from 'common/hooks/useApproveState'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'

export function useTradeApproveState(amountToApprove: Nullish<CurrencyAmount<Currency>>): ApprovalState {
  const spender = useTradeSpenderAddress()

  return useApproveState(amountToApprove, spender)
}

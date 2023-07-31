import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from '../../../types'

import { ApprovalState } from '../../../legacy/hooks/useApproveCallback'

import { useApproveState } from '../../hooks/useApproveState'
import { useTradeSpenderAddress } from '../../hooks/useTradeSpenderAddress'

export function useTradeApproveState(amountToApprove: Nullish<CurrencyAmount<Currency>>): ApprovalState {
  const spender = useTradeSpenderAddress()

  return useApproveState(amountToApprove, spender)
}

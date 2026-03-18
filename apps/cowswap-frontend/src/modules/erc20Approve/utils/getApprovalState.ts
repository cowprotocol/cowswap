import { getIsNativeToken } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { Nullish } from '@cowprotocol/types'

import { ApprovalState } from '../types'

export function getApprovalState(
  amountToApprove: Nullish<CurrencyAmount<Currency>>,
  currentAllowance: bigint | undefined,
  pendingApproval?: boolean,
): ApprovalState {
  if (amountToApprove && getIsNativeToken(amountToApprove.currency)) {
    return ApprovalState.APPROVED
  }

  if (!amountToApprove || typeof currentAllowance === 'undefined') {
    return ApprovalState.UNKNOWN
  }

  const amountToApproveBigInt = BigInt(amountToApprove.quotient.toString())

  if (currentAllowance >= amountToApproveBigInt) {
    return ApprovalState.APPROVED
  }

  if (pendingApproval) {
    return ApprovalState.PENDING
  }

  if (currentAllowance < amountToApproveBigInt) {
    return ApprovalState.NOT_APPROVED
  }

  return ApprovalState.APPROVED
}

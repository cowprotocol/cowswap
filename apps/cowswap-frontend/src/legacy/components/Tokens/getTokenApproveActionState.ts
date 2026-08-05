import { isFractionFalsy } from '@cowprotocol/common-utils'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { ApprovalState } from 'modules/erc20Approve'

export type TokenApproveActionState = 'approved' | 'notApproved' | 'partial' | 'pending'

interface TokenApproveActionStateParams {
  isNativeToken: boolean
  isSolana: boolean
  allowance: CurrencyAmount<Token> | undefined
  account: string | undefined
  approvalState: ApprovalState
  balanceLessThanAllowance: boolean
}

export function getTokenApproveActionState(params: TokenApproveActionStateParams): TokenApproveActionState | null {
  if (params.isNativeToken) return null

  return params.isSolana ? getSolanaDelegationState(params) : getEvmApprovalState(params)
}

function getEvmApprovalState({
  allowance,
  account,
  approvalState,
  balanceLessThanAllowance,
}: TokenApproveActionStateParams): TokenApproveActionState {
  if (approvalState === ApprovalState.APPROVED || balanceLessThanAllowance) return 'approved'

  if (!account || approvalState === ApprovalState.NOT_APPROVED) {
    return isFractionFalsy(allowance) ? 'notApproved' : 'partial'
  }

  return 'pending'
}

function getSolanaDelegationState({
  allowance,
  balanceLessThanAllowance,
}: TokenApproveActionStateParams): TokenApproveActionState {
  if (isFractionFalsy(allowance)) return 'notApproved'

  return balanceLessThanAllowance ? 'approved' : 'partial'
}

import { findSolanaSettlementStatePda } from '@cowprotocol/balances-and-allowances'
import { getIsToken2022, TokenWithLogo } from '@cowprotocol/common-const'

import { t } from '@lingui/core/macro'
import { PublicKey } from '@solana/web3.js'

import { SolanaFlowStep } from './types'

import { buildApproveInstruction } from '../solanaApprove/buildApproveInstruction'

export interface PlanDelegateStepParams {
  owner: PublicKey
  token: TokenWithLogo
  amount: bigint
  /** Currently delegated amount on this token's ATA, e.g. from `useSolanaDelegationAllowance`. */
  currentDelegation: bigint
}

/**
 * Plans the delegate step for a bundled flow. Skips the step when the existing delegation already
 * covers `amount` — reused as-is by both the native-SOL swap flow (delegating WSOL) and the future
 * SPL delegate+create-order flow (delegating the sell token directly), so this never needs to know
 * which flow it's called from.
 */
export function planDelegateStep({
  owner,
  token,
  amount,
  currentDelegation,
}: PlanDelegateStepParams): SolanaFlowStep | null {
  if (amount <= 0n || currentDelegation >= amount) return null

  const instruction = buildApproveInstruction({
    owner,
    mint: new PublicKey(token.address),
    isToken2022: getIsToken2022(token),
    delegate: findSolanaSettlementStatePda(),
    amount,
  })

  const symbol = token.symbol ?? ''

  return {
    instructions: [instruction],
    summary: t`Approve ${symbol}`,
  }
}

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { formatTokenAmount } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { t } from '@lingui/core/macro'
import { ACCOUNT_SIZE } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import { SolanaFlowStep, SolanaFundedAccount } from './types'

import { buildWrapSolInstructions } from '../wrapNativeSolana/buildWrapSolInstructions'
import { getWsolAssociatedTokenAccount } from '../wrapNativeSolana/const'

export interface PlanWrapStepParams {
  owner: PublicKey
  // Native SOL lamports that must land as WSOL — the trade's exact sell amount.
  sellAmount: bigint
}

// `SyncNative` sets the token amount to the account's lamports minus the *current* rent-exempt
// minimum, so the rent an idempotent create instruction funds is always netted back out —
// regardless of whether the WSOL account already existed. `sellAmount` alone is therefore always
// the resulting WSOL amount; no adjustment for account creation is needed (contrast with the
// standalone wrap flow's `getSolanaWrapPreview`, which caps *total spend* at the typed amount instead).
// WSOL is a classic SPL mint, so its account is always the fixed base size — no extensions to resolve.
export function getWrapFundedAccounts(owner: PublicKey): SolanaFundedAccount[] {
  return [{ address: getWsolAssociatedTokenAccount(owner), size: ACCOUNT_SIZE }]
}

export function planWrapStep({ owner, sellAmount }: PlanWrapStepParams): SolanaFlowStep | null {
  if (sellAmount <= 0n) return null

  const sellCurrencyAmount = CurrencyAmount.fromRawAmount(NATIVE_CURRENCIES[SupportedChainId.SOLANA], sellAmount)
  const sellAmountStr = formatTokenAmount(sellCurrencyAmount)

  return {
    instructions: buildWrapSolInstructions({ owner, transferLamports: sellAmount }),
    summary: t`Wrap ${sellAmountStr} SOL`,
    fundedAccounts: getWrapFundedAccounts(owner),
  }
}

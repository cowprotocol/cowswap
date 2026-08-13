import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { formatTokenAmount } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { t } from '@lingui/core/macro'
import { PublicKey } from '@solana/web3.js'

import { SolanaFlowStep } from './types'

import { buildWrapSolInstructions } from '../wrapNativeSolana/buildWrapSolInstructions'

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
export function planWrapStep({ owner, sellAmount }: PlanWrapStepParams): SolanaFlowStep | null {
  if (sellAmount <= 0n) return null

  const sellCurrencyAmount = CurrencyAmount.fromRawAmount(NATIVE_CURRENCIES[SupportedChainId.SOLANA], sellAmount)
  const sellAmountStr = formatTokenAmount(sellCurrencyAmount)

  return {
    instructions: buildWrapSolInstructions({ owner, transferLamports: sellAmount }),
    summary: t`Wrap ${sellAmountStr} SOL`,
  }
}

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { SolanaQuote } from '@cowprotocol/sdk-trading-solana'

import { t } from '@lingui/core/macro'
import { createAssociatedTokenAccountIdempotentInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { deriveSolanaAta } from 'tradingSdk/solana/deriveSolanaAta'

import { SolanaFlowStep, SolanaFundedAccount } from './types'

export type BuyAtaQuote = Pick<SolanaQuote, 'intent' | 'buyTokenProgramId'>

export interface IsBuyAtaCreationSkippedParams {
  quote: BuyAtaQuote
  owner: PublicKey
  /** LaunchDarkly `isAtaCreationDisabled`. */
  isAtaCreationDisabled: boolean
}

export interface PlanCreateBuyAtaStepParams {
  /** Funds the rent: the owner, or the sponsor on a sponsored order. Never the solver. */
  payer: PublicKey
  /** Owner of the created account: the order's receiver, which is not always the payer. */
  receiver: PublicKey
  quote: BuyAtaQuote
  buySymbol: string
  /** Leaves the account to the driver; see `getIsBuyAtaCreationSkipped`. Defaults to false. */
  isCreationSkipped?: boolean
}

// Empty for a native-SOL buy — the skip lives here, not only in the step, so the pre-flight
// `planSolanaTradeFundedAccounts` never prices a buy account the bundle won't create (the native
// sentinel is the System Program address, which `getSolanaTradeOverhead` cannot unpack as a mint).
export function getCreateBuyAtaFundedAccounts(quote: BuyAtaQuote, isCreationSkipped = false): SolanaFundedAccount[] {
  const { intent, buyTokenProgramId } = quote

  if (isCreationSkipped || getIsNativeToken(SupportedChainId.SOLANA, intent.buyMint.toBase58())) {
    return []
  }

  return [
    {
      address: intent.buyTokenAccount,
      // A Token-2022 mint's extensions decide how large its accounts are, so the size is resolved from
      // the mint rather than assumed. A quote without a program id means the classic SPL token program,
      // matching the default `createAssociatedTokenAccountIdempotentInstruction` applies below.
      size: { mint: intent.buyMint, tokenProgramId: buyTokenProgramId ?? TOKEN_PROGRAM_ID },
    },
  ]
}

/**
 * Whether the bundle can leave the buy token account to the driver, which creates a missing one at
 * settle and charges its rent to the trader out of the fill.
 *
 * Only for the owner's own account: placement still refuses an order paying out to another wallet's
 * missing account, since the driver has no way to tell whom an arbitrary address belongs to.
 */
export function getIsBuyAtaCreationSkipped({
  quote,
  owner,
  isAtaCreationDisabled,
}: IsBuyAtaCreationSkippedParams): boolean {
  if (!isAtaCreationDisabled) {
    return false
  }

  const { intent, buyTokenProgramId } = quote
  const ownerAta = deriveSolanaAta(intent.buyMint, owner, buyTokenProgramId)

  return intent.buyTokenAccount.equals(ownerAta)
}

/**
 * Without this, an order buying a token the receiver has never held can never settle: `FinalizeSettle`
 * credits an account that was never created, and SPL Token answers `InvalidAccountData`.
 * Idempotent, so an existing account costs a little compute instead of an RPC check before signing.
 *
 * Skipped for a native-SOL buy: settlement pays that out as lamports, so there is no token account.
 * Skipped too once the driver takes the account over — see `isCreationSkipped`.
 */
export function planCreateBuyAtaStep({
  payer,
  receiver,
  quote,
  buySymbol,
  isCreationSkipped,
}: PlanCreateBuyAtaStepParams): SolanaFlowStep | null {
  const { intent, buyTokenProgramId } = quote
  const fundedAccounts = getCreateBuyAtaFundedAccounts(quote, isCreationSkipped)

  if (fundedAccounts.length === 0) {
    return null
  }

  return {
    instructions: [
      createAssociatedTokenAccountIdempotentInstruction(
        payer,
        intent.buyTokenAccount,
        receiver,
        intent.buyMint,
        buyTokenProgramId,
      ),
    ],
    summary: t`Create ${buySymbol} account`,
    fundedAccounts,
  }
}

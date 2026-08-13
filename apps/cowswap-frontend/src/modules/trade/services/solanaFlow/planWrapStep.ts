import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { formatTokenAmount } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { t } from '@lingui/core/macro'
import { ACCOUNT_SIZE, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'

import { SolanaFlowStep } from './types'

import { buildWrapSolInstructions } from '../wrapNativeSolana/buildWrapSolInstructions'
import { WSOL_MINT } from '../wrapNativeSolana/const'

export interface PlanWrapStepParams {
  connection: Connection
  owner: PublicKey
  // Native SOL lamports that must land as WSOL — the trade's exact sell amount.
  sellAmount: bigint
}

// Unlike the standalone wrap flow (which caps spend and can under-deliver WSOL), the delegate step and order need the exact `sellAmount` — so the transfer is grown by the rent-exempt deposit when the WSOL account doesn't exist yet.
export async function planWrapStep({
  connection,
  owner,
  sellAmount,
}: PlanWrapStepParams): Promise<SolanaFlowStep | null> {
  if (sellAmount <= 0n) return null

  const associatedTokenAccount = getAssociatedTokenAddressSync(WSOL_MINT, owner, false, TOKEN_PROGRAM_ID)

  const [accountInfo, rentExemptLamports] = await Promise.all([
    connection.getAccountInfo(associatedTokenAccount),
    connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE),
  ])

  const transferLamports = accountInfo ? sellAmount : sellAmount + BigInt(rentExemptLamports)
  const sellCurrencyAmount = CurrencyAmount.fromRawAmount(NATIVE_CURRENCIES[SupportedChainId.SOLANA], sellAmount)
  const sellAmountStr = formatTokenAmount(sellCurrencyAmount)

  return {
    instructions: buildWrapSolInstructions({ owner, transferLamports }),
    summary: t`Wrap ${sellAmountStr} SOL`,
  }
}

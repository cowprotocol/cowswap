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
  /** Native SOL lamports that must land as WSOL — the trade's exact sell amount. */
  sellAmount: bigint
}

/**
 * Plans the wrap step for a bundled flow (e.g. native-SOL swap). Unlike the standalone wrap flow
 * (`getSolanaWrapPreview`), which caps total spend at the typed amount and lets the received WSOL
 * fall short on first use, this must guarantee exactly `sellAmount` WSOL lands in the account — the
 * delegate step and the eventual order both key off that exact figure — so when the WSOL associated
 * token account doesn't exist yet, the transfer is grown by the rent-exempt deposit instead of
 * shrunk.
 */
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

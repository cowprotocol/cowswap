import { bytesToHex } from 'viem'

import type { SwapAdvancedSettings } from '@cowprotocol/cow-sdk'
import {
  buildSolanaSwapOrder,
  SolanaOrderIntent,
  SolanaSwapOrder,
  SolanaSwapOrderQuote,
} from '@cowprotocol/sdk-trading-solana'

import { t } from '@lingui/core/macro'
import { PublicKey, PublicKeyInitData } from '@solana/web3.js'

import { SolanaFlowStep, SolanaFundedAccount } from './types'

// Order account layout of the settlement program: every order PDA on chain reports `space: 264`.
const ORDER_ACCOUNT_SIZE = 264

export interface PlanCreateOrderStepParams extends SolanaSwapOrderQuote {
  sellSymbol: string
  buySymbol: string
  /** The user's deadline setting, which the quote knows nothing about — it carries the quote's own TTL. */
  validTo: number
  /** Pays the fee and the order PDA's rent instead of the owner. Omitted for the self-paid flow. */
  sponsor?: PublicKeyInitData
  /** The app's appData doc; the SDK signs its keccak256, the same digest as the app's `appDataKeccak256`. */
  appDataDoc: SwapAdvancedSettings['appData']
}

export interface PlannedCreateOrderStep {
  step: SolanaFlowStep
  orderId: string
  signingScheme: SolanaSwapOrder['signingScheme']
  /** The intent's opaque 32 bytes as actually signed, hex-encoded. The quote's own `appData` is the
   * digest of a different doc, so the local order records this one, as it already does for
   * `sellAmount`/`buyAmount`/`receiver`/`validTo`. */
  appData: string
  /** The doc `appData` is the digest of. Swap only: the SDK merges `appDataDoc` onto the quote's doc, so
   * it can carry keys `appDataDoc` lacks (the SDK's default UTM). A limit order signs the app's own hash. */
  fullAppData?: string
  sellAmount: bigint
  buyAmount: bigint
  /** Who the transaction carrying the step must name as fee payer. */
  feePayer: PublicKey
  /** The intent this step actually signs. Its `buyTokenAccount` is the account the order credits, which
   * is not the quoted one when a limit order rebuilt the intent against a different receiver. */
  intent: SolanaOrderIntent
}

// The PDA carries no address: overriding `validTo` re-derives the uid it is seeded from, so the order
// account this step creates is never the one the quote reported, and is new either way.
export function getCreateOrderFundedAccounts(): SolanaFundedAccount[] {
  return [{ size: ORDER_ACCOUNT_SIZE }]
}

/**
 * Plans a SWAP's `CreateOrder` instruction, correct at whatever price the market implies right now
 * (± slippage) — that's what a swap is. A limit order never goes through this: it needs the user's own
 * price, not the quote's, so it goes through `planCreateLimitOrderStep` instead, which never quotes.
 *
 * `validTo` has to reach the instruction, not just the local order: the quoted intent carries the quote's
 * own TTL rather than the user's deadline, so an order built straight from the quote expires at a time the
 * UI never showed.
 *
 * The SDK owns the order's identity as well as its instruction: overriding `validTo` re-derives `uid` and
 * the order PDA, so `orderId` has to come from the same call that built the instruction rather than from
 * the quoted `solanaQuote.uid`.
 */
export async function planCreateOrderStep({
  quoteResults,
  solanaQuote,
  sellSymbol,
  buySymbol,
  validTo,
  sponsor,
  appDataDoc,
}: PlanCreateOrderStepParams): Promise<PlannedCreateOrderStep> {
  const { instruction, orderId, signingScheme, intent, feePayer, appDataInfo } = await buildSolanaSwapOrder(
    { quoteResults, solanaQuote },
    { quoteRequest: { validTo }, appData: appDataDoc },
    { sponsor },
  )

  if (!appDataInfo) {
    throw new Error('buildSolanaSwapOrder returned no appDataInfo for an appData override')
  }

  return {
    step: {
      instructions: [instruction],
      summary: t`Swap ${sellSymbol} for ${buySymbol}`,
      createdOrderId: orderId,
      fundedAccounts: getCreateOrderFundedAccounts(),
    },
    orderId,
    signingScheme,
    feePayer,
    appData: bytesToHex(intent.appData),
    fullAppData: appDataInfo.fullAppData,
    sellAmount: intent.sellAmount,
    buyAmount: intent.buyAmount,
    intent,
  }
}

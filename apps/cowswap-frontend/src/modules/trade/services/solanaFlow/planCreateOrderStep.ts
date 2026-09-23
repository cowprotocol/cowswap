import { bytesToHex } from 'viem'

import { DEFAULT_APP_CODE } from '@cowprotocol/common-const'
import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import type { SwapAdvancedSettings } from '@cowprotocol/cow-sdk'
import { buildSolanaSwapOrder, SolanaSwapOrder, SolanaSwapOrderQuote } from '@cowprotocol/sdk-trading-solana'

import { t } from '@lingui/core/macro'

import { SolanaFlowStep } from './types'

const DEFAULT_APP_DATA: SwapAdvancedSettings['appData'] = {
  appCode: DEFAULT_APP_CODE,
  environment: isBarnBackendEnv ? 'staging' : 'prod',
  metadata: { orderClass: { orderClass: 'market' } },
}

export interface PlanCreateOrderStepParams extends SolanaSwapOrderQuote {
  sellSymbol: string
  buySymbol: string
  /** The user's deadline setting, which the quote knows nothing about — it carries the quote's own TTL. */
  validTo: number
}

export interface PlannedCreateOrderStep {
  step: SolanaFlowStep
  orderId: string
  signingScheme: SolanaSwapOrder['signingScheme']
  /** The intent's opaque 32 bytes as actually signed, hex-encoded — not the quote's own `appData` (a
   * meaningless stub for Solana, see `getSolanaQuote.ts`'s `ZERO_APP_DATA`). The local order needs this,
   * not the quote's, to record what's genuinely on-chain — mirroring why `buildSolanaOrder()` already
   * overrides `sellAmount`/`buyAmount`/`receiver`/`validTo` from the signed intent instead of the quote. */
  appData: string
  sellAmount: bigint
  buyAmount: bigint
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
}: PlanCreateOrderStepParams): Promise<PlannedCreateOrderStep> {
  const { instruction, orderId, signingScheme, intent } = await buildSolanaSwapOrder(
    { quoteResults, solanaQuote },
    { quoteRequest: { validTo }, appData: DEFAULT_APP_DATA },
  )

  return {
    step: {
      instructions: [instruction],
      summary: t`Swap ${sellSymbol} for ${buySymbol}`,
      createsOrder: true,
    },
    orderId,
    signingScheme,
    appData: bytesToHex(intent.appData),
    sellAmount: intent.sellAmount,
    buyAmount: intent.buyAmount,
  }
}

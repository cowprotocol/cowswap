import { bytesToHex, hexToBytes } from 'viem'

import { backendEnv } from '@cowprotocol/common-utils'
import { buildSolanaLimitOrderOrder, SolanaLimitOrderParams } from '@cowprotocol/sdk-trading-solana'

import { t } from '@lingui/core/macro'

import { getCreateOrderFundedAccounts, PlannedCreateOrderStep } from './planCreateOrderStep'

export interface PlanCreateLimitOrderStepParams extends Omit<SolanaLimitOrderParams, 'appData'> {
  /** keccak256 of the app's `fullAppData`, signed as the intent's opaque 32 bytes. */
  appDataHash: string
  sellSymbol: string
  buySymbol: string
}

/**
 * Plans a limit order's `CreateOrder` instruction directly from the user's own price — unlike
 * `planCreateOrderStep` (swap), this never quotes: `buildSolanaLimitOrderOrder` takes only the raw
 * intent fields, so a limit order's on-chain amounts are never at risk of silently becoming whatever the
 * market happened to imply at quote time.
 */
export async function planCreateLimitOrderStep({
  appDataHash,
  sellSymbol,
  buySymbol,
  ...limitOrderParams
}: PlanCreateLimitOrderStepParams): Promise<PlannedCreateOrderStep> {
  const appData = hexToBytes(appDataHash as `0x${string}`)

  const { instruction, orderId, signingScheme, intent, feePayer } = await buildSolanaLimitOrderOrder({
    ...limitOrderParams,
    appData,
    env: backendEnv,
  })

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
    // From the built intent, not `limitOrderParams` directly — same value here (this builder never
    // overrides them), but keeps both planners reading their return the same way.
    sellAmount: intent.sellAmount,
    buyAmount: intent.buyAmount,
  }
}

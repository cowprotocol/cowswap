import { bytesToHex, hexToBytes } from 'viem'

import { SOLANA_LIMIT_ORDER_PROD_APP_DATA, SOLANA_LIMIT_ORDER_STAGING_APP_DATA } from '@cowprotocol/common-const'
import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { buildSolanaLimitOrderOrder, SolanaLimitOrderParams } from '@cowprotocol/sdk-trading-solana'

import { t } from '@lingui/core/macro'

import { PlannedCreateOrderStep } from './planCreateOrderStep'

export interface PlanCreateLimitOrderStepParams extends Omit<SolanaLimitOrderParams, 'appData'> {
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
  sellSymbol,
  buySymbol,
  ...limitOrderParams
}: PlanCreateLimitOrderStepParams): Promise<PlannedCreateOrderStep> {
  // TODO: add real appData once we have it integrated on backend
  const appDataHex = isBarnBackendEnv ? SOLANA_LIMIT_ORDER_STAGING_APP_DATA : SOLANA_LIMIT_ORDER_PROD_APP_DATA
  const appData = hexToBytes(appDataHex as `0x${string}`)

  const { instruction, orderId, signingScheme, intent } = await buildSolanaLimitOrderOrder({
    ...limitOrderParams,
    appData,
  })

  return {
    step: {
      instructions: [instruction],
      summary: t`Swap ${sellSymbol} for ${buySymbol}`,
      createsOrder: true,
    },
    orderId,
    signingScheme,
    // The actual signed bytes, not the constant we picked — lets the caller store what's really on-chain
    // without re-deriving env logic, and stays correct if this ever stops being a hardcoded pick.
    appData: bytesToHex(intent.appData),
    // From the built intent, not `limitOrderParams` directly — same value here (this builder never
    // overrides them), but keeps both planners reading their return the same way.
    sellAmount: intent.sellAmount,
    buyAmount: intent.buyAmount,
  }
}

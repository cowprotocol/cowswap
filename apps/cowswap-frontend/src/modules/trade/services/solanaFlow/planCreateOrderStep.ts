import { DEFAULT_APP_CODE } from '@cowprotocol/common-const'
import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import type { SwapAdvancedSettings } from '@cowprotocol/cow-sdk'
import { buildSolanaSwapOrder, SolanaSwapOrder, SolanaSwapOrderQuote } from '@cowprotocol/sdk-trading-solana'

import { t } from '@lingui/core/macro'

import { SolanaFlowStep, SolanaFundedAccount } from './types'

// Order account layout of the settlement program: every order PDA on chain reports `space: 264`.
const ORDER_ACCOUNT_SIZE = 264

const DEFAULT_APP_DATA: SwapAdvancedSettings['appData'] = {
  appCode: DEFAULT_APP_CODE,
  environment: isBarnBackendEnv ? 'staging' : 'prod',
}

export interface PlanCreateOrderStepParams extends SolanaSwapOrderQuote {
  sellSymbol: string
  buySymbol: string
  /** The user's deadline setting, which the quote knows nothing about — it carries the quote's own TTL. */
  validTo: number
  /** Overrides the quote's own appData doc — e.g. hooks added after quoting. */
  appData?: SwapAdvancedSettings['appData']
}

export interface PlannedCreateOrderStep {
  step: SolanaFlowStep
  orderId: string
  signingScheme: SolanaSwapOrder['signingScheme']
}

// The PDA carries no address: overriding `validTo` re-derives the uid it is seeded from, so the order
// account this step creates is never the one the quote reported, and is new either way.
export function getCreateOrderFundedAccounts(): SolanaFundedAccount[] {
  return [{ size: ORDER_ACCOUNT_SIZE }]
}

/**
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
  appData,
}: PlanCreateOrderStepParams): Promise<PlannedCreateOrderStep> {
  // TODO: wire up a complete appData object. For now we only need to distinguish swap/limit orders
  const appDataOverride: SwapAdvancedSettings['appData'] = {
    ...DEFAULT_APP_DATA,
    metadata: {
      orderClass: {
        orderClass: appData?.metadata?.orderClass?.orderClass === 'limit' ? 'limit' : 'market',
      },
    },
  }

  const { instruction, orderId, signingScheme } = await buildSolanaSwapOrder(
    { quoteResults, solanaQuote },
    { quoteRequest: { validTo }, appData: appDataOverride },
  )

  return {
    step: {
      instructions: [instruction],
      summary: t`Swap ${sellSymbol} for ${buySymbol}`,
      createsOrder: true,
      fundedAccounts: getCreateOrderFundedAccounts(),
    },
    orderId,
    signingScheme,
  }
}

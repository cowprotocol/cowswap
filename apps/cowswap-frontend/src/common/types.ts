import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

/**
 * https://github.com/rndlabs/composable-cow/blob/main/src/ComposableCoW.sol
 * Information about ComposableCoW conditional orders
 *
 * id - this parameter is specified when it's a conditional (parent) order
 * parentId - this parameter is specified when it's a discrete (child) order
 */
export type ComposableCowInfo = {
  id?: string
  parentId?: string
  isVirtualPart?: boolean
  isTheLastPart?: boolean
}

export type SafeTransactionParams = {
  submissionDate: string
  executionDate: string | null
  isExecuted: boolean
  nonce: number
  confirmationsRequired: number
  confirmations: number
  safeTxHash: string
}

export interface TradeAmounts {
  readonly inputAmount: CurrencyAmount<Currency>
  readonly outputAmount: CurrencyAmount<Currency>
}

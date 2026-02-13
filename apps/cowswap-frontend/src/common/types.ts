import type { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import type { Order } from 'legacy/state/orders/actions'

import type { ParsedOrder } from 'utils/orderUtils/parseOrder'

import type { Hex } from 'viem'

export type GenericOrder = Order | ParsedOrder

/**
 * https://github.com/rndlabs/composable-cow/blob/main/src/ComposableCoW.sol
 * Information about ComposableCoW conditional orders
 *
 * id - this parameter is specified when it's a conditional (parent) order
 * parentId - this parameter is specified when it's a discrete (child) order
 */
export type ComposableCowInfo = {
  id?: Hex
  parentId?: Hex
  isVirtualPart?: boolean
  isTheLastPart?: boolean
}

export type SafeTransactionParams = {
  submissionDate: string
  executionDate: string | null
  isExecuted: boolean
  nonce: string
  confirmationsRequired: number
  confirmations: number
  safeTxHash: string
}

export interface TradeAmounts {
  readonly inputAmount: CurrencyAmount<Currency>
  readonly outputAmount: CurrencyAmount<Currency>
}

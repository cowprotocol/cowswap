import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import { OrderStatus } from 'legacy/state/orders/actions'

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
  isCancelling?: boolean
  status: OrderStatus
}

export type OrderWithComposableCowInfo = {
  order: EnrichedOrder
  composableCowInfo?: ComposableCowInfo
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

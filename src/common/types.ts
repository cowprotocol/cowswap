import { EnrichedOrder } from '@cowprotocol/cow-sdk'

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
}

export type OrderWithComposableCowInfo = {
  order: EnrichedOrder
  composableCowInfo?: ComposableCowInfo
}

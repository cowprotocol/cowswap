import { OrderKind, SupportedChainId, EnrichedOrder } from '@cowprotocol/cow-sdk'
import { TokenInfo, UiOrderType } from '@cowprotocol/types'

export interface OrderUidInChain {
  orderUid: string
  chainId: SupportedChainId
  // TODO: Potentially add all order info here, but lets keep it minimal for now
}

export type BaseOrderPayload = {
  orderUid: string
  chainId: SupportedChainId
  owner: string
  kind: OrderKind
  orderType: UiOrderType
  inputAmount: bigint
  outputAmount: bigint
  inputToken: TokenInfo
  outputToken: TokenInfo
  receiver?: string
}

export type OnPostedOrderPayload = BaseOrderPayload & {
  orderCreationHash?: string
  isEthFlow?: boolean
}

export type OnFulfilledOrderPayload = {
  chainId: SupportedChainId
  order: EnrichedOrder
}

export type OnCancelledOrderPayload = {
  chainId: SupportedChainId
  orderUid: string
  transactionHash?: string
}

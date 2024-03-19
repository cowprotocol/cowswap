import { OrderKind, SupportedChainId, EnrichedOrder } from '@cowprotocol/cow-sdk'
import { TokenInfo, UiOrderType } from '@cowprotocol/types'

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
  order: EnrichedOrder
  transactionHash?: string
}

export type OnExpiredOrderPayload = {
  chainId: SupportedChainId
  order: EnrichedOrder
}

export type OnPresignedOrderPayload = {
  chainId: SupportedChainId
  orderUid: string
  orderType: UiOrderType
}

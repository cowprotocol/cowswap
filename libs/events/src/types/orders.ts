import type { EnrichedOrder, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CrossChainOrder } from '@cowprotocol/sdk-bridging'
import { BridgeOrderDataSerialized, TokenInfo, UiOrderType } from '@cowprotocol/types'

export type BaseOrderPayload = {
  chainId: SupportedChainId
  order: EnrichedOrder
}

export type OnPostedOrderPayload = {
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
  orderCreationHash?: string
  isEthFlow?: boolean
}

export type OnFulfilledOrderPayload = BaseOrderPayload & {
  bridgeOrder?: BridgeOrderDataSerialized
}

export type OnCancelledOrderPayload = BaseOrderPayload & {
  transactionHash?: string
}

export type OnExpiredOrderPayload = BaseOrderPayload

export type OnPresignedOrderPayload = BaseOrderPayload & {
  bridgeOrder?: BridgeOrderDataSerialized
}

export type OnBridgingSuccessPayload = Omit<CrossChainOrder, 'provider'>

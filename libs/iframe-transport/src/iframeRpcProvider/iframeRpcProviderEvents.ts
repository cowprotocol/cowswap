import { IframeTransport } from '../IframeTransport'
import { EIP6963ProviderInfo, JsonRpcRequestMessage, JsonRpcResponse, ProviderWcMetadata } from '../types'

export interface ProviderRpcRequestPayload {
  rpcRequest: JsonRpcRequestMessage
}
export type ProviderRpcResponsePayload = {
  rpcResponse: JsonRpcResponse
}

export interface ProviderOnEventPayload {
  event: string
  params: unknown
}

export interface ProviderMetaInfoPayload {
  providerEip6963Info?: EIP6963ProviderInfo
  providerWcMetadata?: ProviderWcMetadata
}

export enum IframeRpcProviderEvents {
  PROVIDER_RPC_REQUEST = 'PROVIDER_RPC_REQUEST',
  PROVIDER_RPC_RESPONSE = 'PROVIDER_RPC_RESPONSE',
  PROVIDER_ON_EVENT = 'PROVIDER_ON_EVENT',
  SEND_PROVIDER_META_INFO = 'SEND_PROVIDER_META_INFO',
  REQUEST_PROVIDER_META_INFO = 'REQUEST_PROVIDER_META_INFO',
}

export interface IframeEventsPayloadMap {
  [IframeRpcProviderEvents.PROVIDER_RPC_REQUEST]: ProviderRpcRequestPayload
  [IframeRpcProviderEvents.PROVIDER_RPC_RESPONSE]: ProviderRpcResponsePayload
  [IframeRpcProviderEvents.PROVIDER_ON_EVENT]: ProviderOnEventPayload
  [IframeRpcProviderEvents.SEND_PROVIDER_META_INFO]: ProviderMetaInfoPayload
  [IframeRpcProviderEvents.REQUEST_PROVIDER_META_INFO]: null
}

export const iframeRpcProviderTransport = new IframeTransport<IframeEventsPayloadMap>(
  'cowSwapIframeRpcProviderTransport',
)

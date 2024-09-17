import { IframeTransport } from '../IframeTransport'
import { JsonRpcRequestMessage, JsonRpcResponse } from '../types'

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

export enum IframeRpcProviderEvents {
  PROVIDER_RPC_REQUEST = 'PROVIDER_RPC_REQUEST',
  PROVIDER_RPC_RESPONSE = 'PROVIDER_RPC_RESPONSE',
  PROVIDER_ON_EVENT = 'PROVIDER_ON_EVENT',
}

export interface IframeEventsPayloadMap {
  [IframeRpcProviderEvents.PROVIDER_RPC_REQUEST]: ProviderRpcRequestPayload
  [IframeRpcProviderEvents.PROVIDER_RPC_RESPONSE]: ProviderRpcResponsePayload
  [IframeRpcProviderEvents.PROVIDER_ON_EVENT]: ProviderOnEventPayload
}

export const iframeRpcProviderTransport = new IframeTransport<IframeEventsPayloadMap>(
  'cowSwapIframeRpcProviderTransport',
)

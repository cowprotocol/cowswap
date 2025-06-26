export interface JsonRpcRequest {
  id?: number
  method: string
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any[]
}

export interface JsonRpcRequestMessage {
  jsonrpc: '2.0'
  // Optional in the request.
  id?: number
  method: string
  params: unknown[] | undefined
}

export interface BaseJsonRpcResponseMessage {
  // Required but null if not identified in request
  id: number
  jsonrpc: '2.0'
}

export interface JsonRpcSucessfulResponseMessage<TResult = unknown> extends BaseJsonRpcResponseMessage {
  result: TResult
}

export interface JsonRpcError<TData = unknown> {
  code: number
  message: string
  data?: TData
}

export interface JsonRpcErrorResponseMessage<TErrorData = unknown> extends BaseJsonRpcResponseMessage {
  error: JsonRpcError<TErrorData>
}

export type JsonRpcResponse = JsonRpcRequestMessage | JsonRpcErrorResponseMessage | JsonRpcSucessfulResponseMessage

// https://eips.ethereum.org/EIPS/eip-1193
export interface EthereumProvider {
  /**
   * Subscribes to Ethereum-related events.
   * @param event - The event to subscribe to.
   * @param args - Arguments for the event.
   */
  on(event: string, args: unknown): void

  /**
   * Sends a JSON-RPC request to the Ethereum provider and returns the response.
   * @param params - JSON-RPC request parameters.
   * @returns A promise that resolves with the response.
   */
  request<T>(params: JsonRpcRequest): Promise<T>
}

export type WindowListener = (event: MessageEvent<unknown>) => void

export interface ProviderWcMetadata {
  name: string
  description: string
  url: string
  icons: string[]
  verifyUrl?: string
  redirect?: {
    native?: string
    universal?: string
  }
}

export interface EIP6963ProviderInfo {
  uuid: string
  name: string
  icon: string
  rdns: string
}

export interface JsonRpcRequest {
  id?: number
  method: string
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

  /**
   * Requests permission to connect to the Ethereum provider.
   * @returns A promise that resolves once permission is granted.
   */
  enable(): Promise<void>
}

export type WindowListener = (event: MessageEvent<unknown>) => void

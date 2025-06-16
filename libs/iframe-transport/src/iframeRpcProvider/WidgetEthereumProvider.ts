/**
 * ===========================================================================
 * This is a modified version of the original iframe-provider library.
 *
 * The original had some deprecated methods and events, and it was hard to debug for the format used in the messages.
 * This modified version makes use of the Widget library typed subscriptions
 *
 * https://github.com/ethvault/iframe-provider/blob/master/src/index.ts
 *
 *  ===========================================================================
 */

import { EventEmitter } from 'eventemitter3'

import {
  IframeRpcProviderEvents,
  iframeRpcProviderTransport,
  ProviderMetaInfoPayload,
  ProviderOnEventPayload,
  ProviderRpcResponsePayload,
} from './iframeRpcProviderEvents'

import {
  JsonRpcErrorResponseMessage,
  JsonRpcRequest,
  JsonRpcRequestMessage,
  JsonRpcSucessfulResponseMessage,
} from '../types'

interface ProviderConnectInfo {
  readonly chainId: string
}

interface ProviderRpcError extends Error {
  message: string
  code: number
  data?: unknown
}

interface ProviderMessage {
  type: string
  data: unknown
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcCallback = (error: any, response: any) => void

// By default timeout is 10 minutes
const DEFAULT_TIMEOUT_MILLISECONDS = 600000

const JSON_RPC_VERSION = '2.0'

/**
 * Options for constructing the iframe ethereum provider.
 */
interface IFrameEthereumProviderOptions {
  // The origin to communicate with. Default '*'
  targetOrigin?: string
  // How long to time out waiting for responses. Default 60 seconds.
  timeoutMilliseconds?: number

  // The event source. By default we use the window. This can be mocked for tests, or it can wrap
  // a different interface, e.g. workers.
  eventSource?: Window

  // The event target. By default we use the window parent. This can be mocked for tests, or it can wrap
  // a different interface, e.g. workers.
  eventTarget?: Window
}

/**
 * This is what we store in the state to keep track of pending promises.
 */
interface PromiseCompleter<T, D> {
  // A response was received (either error or result response).
  resolve(result: JsonRpcSucessfulResponseMessage<T> | JsonRpcErrorResponseMessage<D>): void

  // An error with executing the request was encountered.
  reject(error: Error): void
}

/**
 * We return a random number between the 0 and the maximum safe integer so that we always generate a unique identifier,
 * across all communication channels.
 */
function getUniqueId(): number {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
}

export type IFrameEthereumProviderEventTypes =
  | 'message'
  | 'connect'
  | 'disconnect'
  | 'chainChanged'
  | 'close' // Deprecated, use 'disconnect' instead
  | 'notification'
  | 'networkChanged' // Deprecated, use 'chainChanged' instead
  | 'accountsChanged'

/**
 * Export the type information about the different events that are emitted.
 */
export interface IFrameEthereumProviderEvents {
  on(event: 'message', handler: (message: ProviderMessage) => void): this

  on(event: 'connect', handler: (connectInfo: ProviderConnectInfo) => void): this

  on(event: 'disconnect', handler: (error: ProviderRpcError) => void): this

  on(event: 'close', handler: (code: number, reason: string) => void): this

  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: 'notification', handler: (result: any) => void): this

  on(event: 'chainChanged', handler: (chainId: string) => void): this

  on(event: 'networkChanged', handler: (networkId: string) => void): this

  on(event: 'accountsChanged', handler: (accounts: string[]) => void): this
}

/**
 * Represents an error in an RPC returned from the event source. Always contains a code and a reason. The message
 * is constructed from both.
 */
export class RpcError extends Error {
  public readonly isRpcError = true

  public readonly code: number
  public readonly reason: string

  constructor(code: number, reason: string) {
    super(`${code}: ${reason}`)

    this.code = code
    this.reason = reason
  }
}

/**
 * This is the primary artifact of this library.
 */
export class WidgetEthereumProvider extends EventEmitter<IFrameEthereumProviderEventTypes> {
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  request({ method, params }: JsonRpcRequest) {
    return this.send(method, params)
  }

  isConnected(): true {
    return true
  }

  /**
   * Differentiate this provider from other providers by providing an isIFrame property that always returns true.
   */
  public get isIFrame(): true {
    return true
  }

  /**
   * Always return this for currentProvider.
   */
  public get currentProvider(): WidgetEthereumProvider {
    return this
  }

  private enabled: Promise<string[]> | null = null
  private readonly timeoutMilliseconds: number
  private readonly eventSource: Window
  private readonly eventTarget: Window
  private readonly completers: {
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [id: string]: PromiseCompleter<any, any>
  } = {}
  private providerMetaInfo: ProviderMetaInfoPayload | null = null
  private providerMetaInfoCallback?: (data: ProviderMetaInfoPayload) => void

  public constructor({
    timeoutMilliseconds = DEFAULT_TIMEOUT_MILLISECONDS,
    eventSource = window,
    eventTarget = window.parent,
  }: IFrameEthereumProviderOptions = {}) {
    // Call super for `this` to be defined
    super()

    this.timeoutMilliseconds = timeoutMilliseconds
    this.eventSource = eventSource
    this.eventTarget = eventTarget

    iframeRpcProviderTransport.listenToMessageFromWindow(
      this.eventSource,
      IframeRpcProviderEvents.PROVIDER_RPC_RESPONSE,
      (message) => {
        this.handleRpcRequests(message)
      },
    )

    iframeRpcProviderTransport.listenToMessageFromWindow(
      this.eventSource,
      IframeRpcProviderEvents.PROVIDER_ON_EVENT,
      (message) => {
        this.handleOnEvent(message)
      },
    )

    iframeRpcProviderTransport.listenToMessageFromWindow(
      this.eventSource,
      IframeRpcProviderEvents.SEND_PROVIDER_META_INFO,
      (message) => {
        this.providerMetaInfo = message

        if (this.providerMetaInfoCallback) {
          this.providerMetaInfoCallback(this.providerMetaInfo)
        }
      },
    )
  }

  /**
   * Helper method that handles transport and request wrapping
   * @param method method to execute
   * @param params params to pass the method
   */
  private async execute<TResult, TErrorData>(
    method: string,
    params: unknown[] | undefined,
  ): Promise<JsonRpcSucessfulResponseMessage<TResult> | JsonRpcErrorResponseMessage<TErrorData>> {
    const id = getUniqueId()

    const rpcRequest: JsonRpcRequestMessage = {
      jsonrpc: JSON_RPC_VERSION,
      id,
      method,
      params,
    }

    const promise = new Promise<JsonRpcSucessfulResponseMessage<TResult> | JsonRpcErrorResponseMessage<TErrorData>>(
      (resolve, reject) => (this.completers[id] = { resolve, reject }),
    )

    // Send the JSON RPC to the event source.
    iframeRpcProviderTransport.postMessageToWindow(this.eventTarget, IframeRpcProviderEvents.PROVIDER_RPC_REQUEST, {
      rpcRequest,
    })

    // Delete the completer within the timeout and reject the promise.
    setTimeout(() => {
      if (this.completers[id]) {
        this.completers[id].reject(new Error('Request timed out. Please try again and submit it faster.'))
        delete this.completers[id]
      }
    }, this.timeoutMilliseconds)

    return promise
  }

  /**
   * Send the JSON RPC and return the result.
   */
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async send<TResult = any>(request: JsonRpcRequest, callback: RpcCallback): Promise<TResult>
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async send<TResult = any>(method: string, params: unknown[] | undefined): Promise<TResult>
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async send<TResult = any>(
    methodOrRequest: string | JsonRpcRequest,
    paramsOrCallback: unknown[] | undefined | RpcCallback,
  ): Promise<TResult> {
    const { method, params } =
      typeof methodOrRequest === 'string'
        ? { method: methodOrRequest, params: paramsOrCallback as unknown[] }
        : { method: methodOrRequest.method, params: methodOrRequest.params }

    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await this.execute<TResult, any>(method, params)

    if ('error' in response) {
      throw new RpcError(response.error.code, response.error.message)
    } else {
      return response.result
    }
  }

  /**
   * Request the parent window to enable access to the user's web3 provider. Return accounts list immediately if already enabled.
   * Keep the legacy method for backward compatibility.
   */
  public async enable(): Promise<string[]> {
    if (this.enabled === null) {
      const promise = (this.enabled = this.send('eth_requestAccounts', []).catch((error) => {
        // Clear this.enabled if it's this promise so we try again next call.
        // this.enabled might be set from elsewhere if, e.g. the accounts changed event is emitted
        if (this.enabled === promise) {
          this.enabled = null
        }
        // Rethrow the error.
        throw error
      }))
    }

    return this.enabled
  }

  /**
   * Backwards compatibility method for web3.
   * @param payload payload to send to the provider
   * @param callback callback to be called when the provider resolves
   */
  public async sendAsync(
    payload: JsonRpcRequest,
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (error: string | null, result: { method: string; params?: any[]; result: any } | any) => void,
  ): Promise<void> {
    try {
      const result = await this.execute(payload.method, payload.params)

      callback(null, result)
    } catch (error) {
      callback(error, null)
    }
  }

  /**
   * Subscribe to provider meta info
   * @param callback
   */
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public onProviderMetaInfo(callback: (data: ProviderMetaInfoPayload) => void) {
    if (this.providerMetaInfo) {
      callback(this.providerMetaInfo)
    } else {
      this.providerMetaInfoCallback = callback

      iframeRpcProviderTransport.postMessageToWindow(
        this.eventTarget,
        IframeRpcProviderEvents.REQUEST_PROVIDER_META_INFO,
        null,
      )
    }
  }

  /**
   * Handle a Rpc Request
   */
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private handleRpcRequests = ({ rpcResponse }: ProviderRpcResponsePayload) => {
    if (rpcResponse.id === undefined || rpcResponse.id === null) {
      return
    }

    const completer = this.completers['' + rpcResponse.id]

    // True if we haven't timed out and this is a response to a message we sent.
    if (completer) {
      // Handle pending promise
      if ('error' in rpcResponse || 'result' in rpcResponse) {
        completer.resolve(rpcResponse)
      } else {
        completer.reject(new Error('Response from provider did not have error or result key'))
      }

      delete this.completers[rpcResponse.id]
    }
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private handleOnEvent(message: ProviderOnEventPayload) {
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params = message.params as any
    switch (message.event) {
      case 'notification':
        this.emitNotification(params)
        break

      case 'connect':
        this.emitConnect(params)
        break

      case 'disconnect':
        this.emitDisconnect(params)
        break

      case 'chainChanged':
        this.emitChainChanged(params)
        break

      case 'accountsChanged':
        this.emitAccountsChanged(params)
        break

      case 'message':
        this.emitMessage(params)
        break

      // Deprecated events below 👇   --------------------------------------
      case 'networkChanged':
        this.emitNetworkChanged(params)
        break

      case 'close':
        this.emitClose(params)
        break

      // END OF: Deprecated events   --------------------------------------

      default:
        console.warn(`[WidgetEthereumProvider] Unknown event type: ${message.event}`)
        break
    }
  }

  // TODO: Add proper return type annotation
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
  private emitNotification(result: any) {
    this.emit('notification', result)
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private emitConnect(connectInfo: ProviderConnectInfo) {
    // If the provider isn't enabled but it emits a connect event, assume that it's enabled and initialize
    // with an empty list of accounts.
    if (this.enabled === null) {
      this.enabled = Promise.resolve([])
    }
    this.emit('connect', connectInfo)
  }

  /**
   * @deprecated See https://eips.ethereum.org/EIPS/eip-1193
   */
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private emitClose(params: unknown) {
    if (Array.isArray(params) && params.length === 2) {
      this.emit('close', params[0], params[1])
    } else {
      this.emit('close')
    }
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private emitDisconnect(error: ProviderRpcError) {
    this.emit('disconnect', error)
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private emitChainChanged(chainId: string) {
    this.emit('chainChanged', chainId)
  }

  /**
   * @deprecated See https://eips.ethereum.org/EIPS/eip-1193
   */
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private emitNetworkChanged(networkId: string) {
    this.emit('networkChanged', networkId)
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private emitAccountsChanged(accounts: string[]) {
    this.enabled = Promise.resolve(accounts)
    this.emit('accountsChanged', accounts)
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private emitMessage(message: ProviderMessage) {
    this.emit('message', message)
  }
}

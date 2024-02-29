import { listenToMessageFromWindow, postMessageToWindow, stopListeningToMessageFromWindow } from './messages'
import {
  EthereumProvider,
  JsonRpcRequestMessage,
  ProviderRpcRequestPayload,
  ProviderRpcResponsePayload,
  WidgetMethodsEmit,
  WidgetMethodsListen,
} from './types'

const EVENTS_TO_FORWARD_TO_IFRAME = ['connect', 'disconnect', 'close', 'chainChanged', 'accountsChanged']

/**
 * Handles JSON-RPC request comming from an iFrame by delegating to a given Ethereum provider.
 * The result will be passed back to the iFrame.
 *
 * Additionally, it will forward some special events from the wallet, to the iFrame window, for example connect/disconnect/chainChanged
 */
export class IframeRpcProviderBridge {
  /**
   * The Ethereum provider instance.
   * When is null the JSON-RPC bridge is disconnected from the Ethereum provider.
   * */
  private ethereumProvider: EthereumProvider | null = null

  /** Stored JSON-RPC requests, to queue them when disconnected. */
  private requestWaitingForConnection: { [key: string]: JsonRpcRequestMessage } = {}

  /**
   * Creates an instance of IframeRpcProviderBridge.
   * @param iframeWidow - The iFrame window that will post up general RPC messages and to which the IframeRpcProviderBridge will forward the RPC result.
   *  Also it will receive some special RPC events coming from the wallet, like connect/chainChanged,accountChanged
   */
  constructor(private iframeWidow: Window) {}

  /**
   * Disconnects the JSON-RPC bridge from the Ethereum provider.
   */
  disconnect() {
    // Disconnect provider
    this.ethereumProvider = null
    stopListeningToMessageFromWindow(window, WidgetMethodsEmit.PROVIDER_RPC_REQUEST, this.processRpcCallFromWindow)
  }

  /**
   * Handles the 'connect' event and sets up event listeners for Ethereum provider events.
   * @param newProvider - The Ethereum provider to connect.
   */
  onConnect(newProvider: EthereumProvider) {
    // Disconnect the previous provider
    if (this.ethereumProvider) {
      this.disconnect()
    } else {
      // Listen for messages coming to the main window (from the iFrame window)
      listenToMessageFromWindow(window, WidgetMethodsEmit.PROVIDER_RPC_REQUEST, this.processRpcCallFromWindow)
    }

    // Save the provider
    this.ethereumProvider = newProvider

    // Process pending requests
    this.processPendingRequests()

    // Register in the provider, the events that needs to be forwarded to the iFrame window
    EVENTS_TO_FORWARD_TO_IFRAME.forEach((event) => {
      newProvider.on(event, (params: unknown) => this.onProviderEvent(event, params))
    })
  }

  private processPendingRequests() {
    // Process pending requests
    Object.keys(this.requestWaitingForConnection).forEach((key) => {
      this.processRpcRequest(this.requestWaitingForConnection[key])
    })

    // Clear pending requests
    this.requestWaitingForConnection = {}
  }

  /**
   * Processes a JSON-RPC request and sends appropriate response or error via the content window.
   * @param request - The JSON-RPC request to be processed.
   */
  processRpcRequest(request: JsonRpcRequestMessage) {
    const { id, jsonrpc, method } = request
    if (!this.ethereumProvider || !id) {
      return
    }
    const requestPromise =
      method === 'enable' ? this.ethereumProvider.enable() : this.ethereumProvider.request({ ...request, id })

    // Do request, and forward the result or error to the iFrame window
    requestPromise
      .then((result) =>
        this.forwardRpcResponseToIframe({
          rpcResponse: { jsonrpc, id, result },
        })
      )
      .catch((error) =>
        this.forwardRpcResponseToIframe({
          rpcResponse: { jsonrpc, id, error },
        })
      )
  }

  private processRpcCallFromWindow = ({ rpcRequest }: ProviderRpcRequestPayload): void => {
    // If disconnected, ignore the message. Also persist the request
    if (!this.ethereumProvider) {
      if (rpcRequest.id) {
        this.requestWaitingForConnection[rpcRequest.id] = rpcRequest
      }
      return
    }

    this.processRpcRequest(rpcRequest)
  }

  private onProviderEvent(event: string, params: unknown): void {
    postMessageToWindow(this.iframeWidow, WidgetMethodsListen.PROVIDER_ON_EVENT, {
      event,
      params,
    })
  }

  /**
   * Forward a JSON-RPC message to the content window.
   */
  private forwardRpcResponseToIframe(params: ProviderRpcResponsePayload) {
    postMessageToWindow(this.iframeWidow, WidgetMethodsListen.PROVIDER_RPC_RESPONSE, params)
  }
}

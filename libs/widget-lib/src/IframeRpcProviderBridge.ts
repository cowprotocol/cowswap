import { EthereumProvider, JsonRpcRequest } from './types'

const JSON_PRC_V = '2.0'
const TARGET_ORIGIN = '*'
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
  private requestWaitingForConnection: { [key: string]: JsonRpcRequest } = {}

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
    // If it was connected, unregister the forwarding events
    if (this.ethereumProvider !== null) {
      const ethereumProvider = this.ethereumProvider
      EVENTS_TO_FORWARD_TO_IFRAME.forEach((event) => {
        ethereumProvider.off(event, this.onRpcEventForwardToIframe)
      })
    }

    // Disconnect provider
    this.ethereumProvider = null
    window.removeEventListener('message', this.processRpcCallFromWindow)
  }

  /**
   * Handles the 'connect' event and sets up event listeners for Ethereum provider events.
   * @param ethereumProvider - The Ethereum provider to connect.
   */
  onConnect(ethereumProvider: EthereumProvider) {
    if (this.ethereumProvider) {
      this.disconnect()
    }

    // Save the provider
    this.ethereumProvider = ethereumProvider

    // Listen for messages coming to the main window (from the iFrame window)
    window.addEventListener('message', this.processRpcCallFromWindow)

    // Process pending requests
    this.processPendingRequests()

    // Register in the provider, the events that needs to be forwarded to the iFrame window
    EVENTS_TO_FORWARD_TO_IFRAME.forEach((event) => {
      ethereumProvider.on(event, this.onRpcEventForwardToIframe)
    })
  }

  private processPendingRequests() {
    // Process pending requests
    Object.keys(this.requestWaitingForConnection).forEach((key) => {
      this.processRequest(this.requestWaitingForConnection[key])
    })

    // Clear pending requests
    this.requestWaitingForConnection = {}
  }

  /**
   * Processes a JSON-RPC request and sends appropriate response or error via the content window.
   * @param request - The JSON-RPC request to be processed.
   */
  processRequest(request: JsonRpcRequest) {
    if (!this.ethereumProvider) return

    const requestPromise =
      request.method === 'enable' ? this.ethereumProvider.enable() : this.ethereumProvider.request(request)

    // Do request, and forward the result or error to the iFrame window
    requestPromise
      .then((result) => this.forwardRpcCallToIframe({ id: request.id, result }))
      .catch((error) => this.forwardRpcCallToIframe({ id: request.id, error }))
  }

  private processRpcCallFromWindow = (event: MessageEvent): void => {
    if (!this.isRpcCall(event)) {
      return
    }

    // If disconnected, ignore the message. Also persist the request
    if (!this.ethereumProvider) {
      if (event.data.id) {
        this.requestWaitingForConnection[event.data.id] = event.data
      }
      return
    }

    // Delegate the rpc call
    this.processRequest(event.data)
  }

  private isRpcCall(event: MessageEvent) {
    return event.data.jsonrpc === '2.0'
  }

  private onRpcEventForwardToIframe(params: unknown): void {
    this.forwardRpcCallToIframe({ method: event, params: [params] })
  }

  /**
   * Forward a JSON-RPC message to the content window.
   */
  private forwardRpcCallToIframe(params: { [key: string]: unknown }) {
    this.iframeWidow.postMessage(
      {
        jsonrpc: JSON_PRC_V,
        ...params,
      },
      TARGET_ORIGIN
    )
  }
}

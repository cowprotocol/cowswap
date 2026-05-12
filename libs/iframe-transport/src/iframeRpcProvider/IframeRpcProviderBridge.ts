import type { EIP6963AnnounceProviderEvent, EIP6963ProviderDetail } from '@cowprotocol/types'

import {
  IframeRpcProviderEvents,
  iframeRpcProviderTransport,
  ProviderRpcRequestPayload,
  ProviderRpcResponsePayload,
} from './iframeRpcProviderEvents'
import { getEip6963ProviderInfo, getProviderWcMetadata } from './utils'

import type { EthereumProvider, JsonRpcRequestMessage } from '../types'

/**
 * EIP-1193 provider that optionally exposes `removeListener` for event-cleanup.
 */
export type EthereumProviderWithRemoveListener = EthereumProvider & {
  removeListener?(event: string, handler: (...args: unknown[]) => void): void
}

const EVENTS_TO_FORWARD_TO_IFRAME = ['connect', 'disconnect', 'close', 'chainChanged', 'accountsChanged']
const eip6963Providers: EIP6963ProviderDetail[] = []

if (typeof window !== 'undefined') {
  window.addEventListener('eip6963:announceProvider', (event: Event) => {
    const providerEvent = event as EIP6963AnnounceProviderEvent
    eip6963Providers.push(providerEvent.detail)
  })
}

/**
 * Handles JSON-RPC request coming from an iFrame by delegating to a given Ethereum provider.
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

  /** Bound event-forwarding listeners so they can be removed on disconnect. */
  private providerEventListeners: Array<{ event: string; handler: (params: unknown) => void }> = []

  /**
   * Creates an instance of IframeRpcProviderBridge.
   * @param iframeWindow - The iFrame window that will post up general RPC messages and to which the IframeRpcProviderBridge will forward the RPC result.
   *  Also it will receive some special RPC events coming from the wallet, like connect/chainChanged,accountChanged
   */
  constructor(
    private iframeWindow: Window,
    private iframeOrigin?: string,
  ) {}

  /**
   * Disconnects the JSON-RPC bridge from the Ethereum provider.
   */
  disconnect(): void {
    if (typeof window === 'undefined') return

    // Remove event-forwarding listeners from the provider before dropping the reference.
    if (this.ethereumProvider) {
      const provider = this.ethereumProvider as EthereumProviderWithRemoveListener
      if (typeof provider.removeListener === 'function') {
        for (const { event, handler } of this.providerEventListeners) {
          provider.removeListener(event, handler)
        }
      }
    }
    this.providerEventListeners = []

    // Disconnect provider
    this.ethereumProvider = null
    iframeRpcProviderTransport.stopListeningToMessageFromWindow(
      window,
      IframeRpcProviderEvents.PROVIDER_RPC_REQUEST,
      this.processRpcCallFromWindow,
    )

    iframeRpcProviderTransport.stopListeningToMessageFromWindow(
      window,
      IframeRpcProviderEvents.REQUEST_PROVIDER_META_INFO,
      this.processProviderMetaInfoRequest,
    )
  }

  /**
   * Handles the 'connect' event and sets up event listeners for Ethereum provider events.
   * @param newProvider - The Ethereum provider to connect.
   */
  onConnect(newProvider: EthereumProvider): void {
    if (typeof window === 'undefined') return

    // Disconnect the previous provider
    if (this.ethereumProvider) {
      this.disconnect()
    } else {
      // Listen for messages coming to the main window (from the iFrame window)
      iframeRpcProviderTransport.listenToMessageFromWindow(
        window,
        this.iframeWindow,
        IframeRpcProviderEvents.PROVIDER_RPC_REQUEST,
        this.processRpcCallFromWindow,
        this.iframeOrigin,
      )
    }

    // Save the provider
    this.ethereumProvider = newProvider

    // Process pending requests
    this.processPendingRequests()

    // Register in the provider, the events that needs to be forwarded to the iFrame window.
    // Store references so they can be removed on disconnect().
    EVENTS_TO_FORWARD_TO_IFRAME.forEach((event) => {
      const handler = (params: unknown): void => this.onProviderEvent(event, params)
      this.providerEventListeners.push({ event, handler })
      newProvider.on(event, handler)
    })

    // Listen for provider meta info request
    iframeRpcProviderTransport.listenToMessageFromWindow(
      window,
      this.iframeWindow,
      IframeRpcProviderEvents.REQUEST_PROVIDER_META_INFO,
      this.processProviderMetaInfoRequest,
      this.iframeOrigin,
    )
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  processRpcRequest(request: JsonRpcRequestMessage) {
    const { id, jsonrpc, method } = request
    if (!this.ethereumProvider || !id) {
      return
    }
    const requestPromise =
      // Keep the legacy "enable" method for backward compatibility
      method === 'enable'
        ? this.ethereumProvider.request({ method: 'eth_requestAccounts', id })
        : this.ethereumProvider.request({ ...request, id })

    // Do request, and forward the result or error to the iFrame window
    requestPromise
      .then((result) =>
        this.forwardRpcResponseToIframe({
          rpcResponse: { jsonrpc, id, result },
        }),
      )
      .catch((error) =>
        this.forwardRpcResponseToIframe({
          rpcResponse: { jsonrpc, id, error },
        }),
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

  private processProviderMetaInfoRequest = (): void => {
    if (!this.ethereumProvider) return
    // We assume, that all EIP-6963 providers are already announced
    const providerEip6963Info = getEip6963ProviderInfo(this.ethereumProvider, eip6963Providers)
    const providerWcMetadata = getProviderWcMetadata(this.ethereumProvider)

    // Send the provider meta info to the iFrame window
    iframeRpcProviderTransport.postMessageToWindow(
      this.iframeWindow,
      IframeRpcProviderEvents.SEND_PROVIDER_META_INFO,
      { providerEip6963Info, providerWcMetadata },
      this.iframeOrigin,
    )
  }

  private onProviderEvent(event: string, params: unknown): void {
    iframeRpcProviderTransport.postMessageToWindow(
      this.iframeWindow,
      IframeRpcProviderEvents.PROVIDER_ON_EVENT,
      { event, params },
      this.iframeOrigin,
    )
  }

  /**
   * Forward a JSON-RPC message to the content window.
   */
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private forwardRpcResponseToIframe(params: ProviderRpcResponsePayload) {
    iframeRpcProviderTransport.postMessageToWindow(
      this.iframeWindow,
      IframeRpcProviderEvents.PROVIDER_RPC_RESPONSE,
      params,
      this.iframeOrigin,
    )
  }
}

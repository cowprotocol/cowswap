import {
  IframeSolanaProviderEvents,
  iframeSolanaProviderTransport,
  SolanaProviderRequest,
  SolanaProviderRequestPayload,
  SolanaProviderResponse,
} from './solanaProviderEvents'
import {
  SolanaProvider,
  SolanaProviderEvent,
  SolanaProviderEventHandler,
  SolanaProviderMethod,
} from './solanaProviderTypes'

import type { WindowListener } from '../types'

const EVENTS_TO_FORWARD_TO_IFRAME = [SolanaProviderEvent.ACCOUNTS_CHANGED, SolanaProviderEvent.DISCONNECT]

/**
 * Serves the widget's Solana wallet requests from the host's wallet, and forwards the host
 * wallet's account changes back into the iframe.
 *
 * Solana counterpart of {@link IframeRpcProviderBridge}. The widget signs nothing itself in dapp
 * mode: it serializes each transaction, posts it up here, and gets the signed bytes back.
 */
export class IframeSolanaProviderBridge {
  private solanaProvider: SolanaProvider | null = null

  /**
   * Requests that arrived before a provider was connected, replayed once one is.
   *
   * A dapp-mode host usually connects its Solana wallet asynchronously, so the widget's first
   * `connect` can genuinely beat it. Dropping it would leave the widget unconnected with nothing
   * to retry it.
   */
  private requestsWaitingForConnection: SolanaProviderRequest[] = []

  private providerEventListeners: Array<{ event: SolanaProviderEvent; handler: SolanaProviderEventHandler }> = []

  private requestListener: WindowListener | null = null

  constructor(
    private iframeWindow: Window,
    private iframeOrigin?: string,
  ) {
    if (typeof window === 'undefined') return

    this.requestListener = iframeSolanaProviderTransport.listenToMessageFromWindow(
      window,
      this.iframeWindow,
      IframeSolanaProviderEvents.SOLANA_PROVIDER_REQUEST,
      this.processRequestFromWindow,
      this.iframeOrigin,
    )
  }

  disconnect(): void {
    if (typeof window === 'undefined') return

    this.detachProviderListeners()
    this.solanaProvider = null

    // Anything still queued can never be answered now; fail it rather than let the widget wait out
    // the request timeout.
    const pending = this.requestsWaitingForConnection
    this.requestsWaitingForConnection = []
    pending.forEach(({ id }) => this.forwardResponseToIframe({ id, error: 'The host wallet was disconnected' }))

    if (this.requestListener) {
      iframeSolanaProviderTransport.stopListeningWindowListener(window, this.requestListener)
    }
  }

  onConnect(newProvider: SolanaProvider): void {
    if (typeof window === 'undefined') return

    this.detachProviderListeners()
    this.solanaProvider = newProvider

    const pendingRequests = this.requestsWaitingForConnection
    this.requestsWaitingForConnection = []
    pendingRequests.forEach((request) => this.processRequest(request))

    if (typeof newProvider.on !== 'function') return

    EVENTS_TO_FORWARD_TO_IFRAME.forEach((event) => {
      const handler: SolanaProviderEventHandler = (accounts) => this.onProviderEvent(event, accounts)

      this.providerEventListeners.push({ event, handler })
      newProvider.on?.(event, handler)
    })
  }

  private detachProviderListeners(): void {
    const provider = this.solanaProvider

    if (provider && typeof provider.removeListener === 'function') {
      for (const { event, handler } of this.providerEventListeners) {
        provider.removeListener(event, handler)
      }
    }

    this.providerEventListeners = []
  }

  private processRequestFromWindow = ({ solanaRequest }: SolanaProviderRequestPayload): void => {
    if (!this.solanaProvider) {
      this.requestsWaitingForConnection.push(solanaRequest)
      return
    }

    this.processRequest(solanaRequest)
  }

  private processRequest(request: SolanaProviderRequest): void {
    const provider = this.solanaProvider

    if (!provider) return

    this.callProvider(provider, request)
      .then((result) => this.forwardResponseToIframe({ id: request.id, result }))
      .catch((err: unknown) => this.forwardResponseToIframe({ id: request.id, error: stringifyError(err) }))
  }

  private async callProvider(provider: SolanaProvider, request: SolanaProviderRequest): Promise<string[]> {
    const { method, params } = request

    switch (method) {
      case SolanaProviderMethod.CONNECT:
        return provider.connect()

      case SolanaProviderMethod.DISCONNECT:
        await provider.disconnect()
        return []

      case SolanaProviderMethod.SIGN_TRANSACTIONS:
        return provider.signTransactions(params)

      default:
        throw new Error(`Unknown Solana provider method: ${method}`)
    }
  }

  private onProviderEvent(event: SolanaProviderEvent, accounts: string[]): void {
    iframeSolanaProviderTransport.postMessageToWindow(
      this.iframeWindow,
      IframeSolanaProviderEvents.SOLANA_PROVIDER_ON_EVENT,
      { event, accounts },
      this.iframeOrigin,
    )
  }

  private forwardResponseToIframe(solanaResponse: SolanaProviderResponse): void {
    iframeSolanaProviderTransport.postMessageToWindow(
      this.iframeWindow,
      IframeSolanaProviderEvents.SOLANA_PROVIDER_RESPONSE,
      { solanaResponse },
      this.iframeOrigin,
    )
  }
}

function stringifyError(err: unknown): string {
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message

  return 'Unknown Solana provider error'
}

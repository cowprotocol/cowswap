import EventEmitter from 'eventemitter3'

import {
  IframeSolanaProviderEvents,
  iframeSolanaProviderTransport,
  SolanaProviderOnEventPayload,
  SolanaProviderResponsePayload,
} from './solanaProviderEvents'
import { SolanaProviderEvent, SolanaProviderMethod } from './solanaProviderTypes'

import { getParentOrigin } from '../getParentOrigin'

const DEFAULT_TARGET_ORIGIN = 'https://swap.cow.fi'

// Matches WidgetEthereumProvider: a signature prompt in the host's wallet can sit unanswered for
// a long time, and timing it out early would strand the widget's pending trade.
const DEFAULT_TIMEOUT_MILLISECONDS = 600000

interface PromiseCompleter {
  reject(error: Error): void
  resolve(result: string[]): void
}

interface WidgetSolanaProviderOptions {
  eventSource?: Window
  eventTarget?: Window
  targetOrigin?: string
  timeoutMilliseconds?: number
}

/**
 * The widget's end of {@link IframeSolanaProviderBridge}: a Solana wallet backed by the host dapp.
 *
 * It holds no keys and knows nothing about Solana's types — transactions cross the iframe boundary
 * as base64 and accounts as base58. `libs/wallet` wraps this into a Wallet Standard wallet, which
 * is what Reown AppKit discovers and what the rest of the app actually talks to.
 */
export class WidgetSolanaProvider extends EventEmitter<SolanaProviderEvent> {
  private accounts: string[] = []
  private readonly completers: { [id: string]: PromiseCompleter } = {}
  private readonly eventTarget: Window
  private readonly targetOrigin: string
  private readonly timeoutMilliseconds: number

  constructor({
    eventSource = window,
    eventTarget = window.parent,
    targetOrigin,
    timeoutMilliseconds = DEFAULT_TIMEOUT_MILLISECONDS,
  }: WidgetSolanaProviderOptions = {}) {
    super()

    this.eventTarget = eventTarget
    this.targetOrigin = targetOrigin || getParentOrigin() || DEFAULT_TARGET_ORIGIN
    this.timeoutMilliseconds = timeoutMilliseconds

    iframeSolanaProviderTransport.listenToMessageFromWindow(
      eventSource,
      this.eventTarget,
      IframeSolanaProviderEvents.SOLANA_PROVIDER_RESPONSE,
      (message) => this.handleResponse(message),
      this.targetOrigin,
    )

    iframeSolanaProviderTransport.listenToMessageFromWindow(
      eventSource,
      this.eventTarget,
      IframeSolanaProviderEvents.SOLANA_PROVIDER_ON_EVENT,
      (message) => this.handleProviderEvent(message),
      this.targetOrigin,
    )
  }

  /** Base58 addresses the host last reported, empty while nothing is connected. */
  get connectedAccounts(): string[] {
    return this.accounts
  }

  async connect(): Promise<string[]> {
    this.accounts = await this.request(SolanaProviderMethod.CONNECT, [])

    return this.accounts
  }

  async disconnect(): Promise<void> {
    await this.request(SolanaProviderMethod.DISCONNECT, [])
    this.accounts = []
  }

  signTransactions(transactionsBase64: string[]): Promise<string[]> {
    return this.request(SolanaProviderMethod.SIGN_TRANSACTIONS, transactionsBase64)
  }

  private request(method: SolanaProviderMethod, params: string[]): Promise<string[]> {
    const id = getUniqueId()

    const promise = new Promise<string[]>((resolve, reject) => {
      this.completers[id] = { resolve, reject }
    })

    iframeSolanaProviderTransport.postMessageToWindow(
      this.eventTarget,
      IframeSolanaProviderEvents.SOLANA_PROVIDER_REQUEST,
      { solanaRequest: { id, method, params } },
      this.targetOrigin,
    )

    setTimeout(() => {
      const completer = this.completers[id]

      if (completer) {
        delete this.completers[id]
        completer.reject(new Error(`The host wallet did not answer the "${method}" request in time.`))
      }
    }, this.timeoutMilliseconds)

    return promise
  }

  private handleResponse({ solanaResponse }: SolanaProviderResponsePayload): void {
    const completer = this.completers[solanaResponse.id]

    if (!completer) return

    delete this.completers[solanaResponse.id]

    if (solanaResponse.error !== undefined) {
      completer.reject(new Error(solanaResponse.error))
    } else {
      completer.resolve(solanaResponse.result || [])
    }
  }

  private handleProviderEvent({ accounts, event }: SolanaProviderOnEventPayload): void {
    this.accounts = event === SolanaProviderEvent.DISCONNECT ? [] : accounts || []

    this.emit(event, this.accounts)
  }
}

function getUniqueId(): number {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
}

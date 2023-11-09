import { EthereumProvider, JsonRpcRequest } from './types'

const JSON_PRC_V = '2.0'
const TARGET_ORIGIN = '*'
const EVENTS = ['connect', 'disconnect', 'close', 'chainChanged', 'accountsChanged']

/**
 * Manages JSON-RPC requests and interactions with an Ethereum provider.
 */
export class JsonRpcManager {
  /**
   * The Ethereum provider instance.
   * When is null the JSON-RPC manager is disconnected from the Ethereum provider.
   * */
  private ethereumProvider: EthereumProvider | null = null

  /** Stored JSON-RPC requests. */
  private requests: { [key: string]: JsonRpcRequest } = {}

  /**
   * Creates an instance of JsonRpcManager.
   * @param contentWindow - The window for handling events.
   */
  constructor(private contentWindow: Window) {
    window.addEventListener('message', this.processEvent)
  }

  /**
   * Disconnects the JSON-RPC manager from the Ethereum provider.
   */
  disconnect() {
    this.ethereumProvider = null
    window.removeEventListener('message', this.processEvent)
  }

  /**
   * Handles the 'connect' event and sets up event listeners for Ethereum provider events.
   * @param ethereumProvider - The Ethereum provider to connect.
   */
  onConnect(ethereumProvider: EthereumProvider) {
    this.ethereumProvider = ethereumProvider

    Object.keys(this.requests).forEach((key) => {
      this.processRequest(this.requests[key])
    })

    this.requests = {}

    EVENTS.forEach((event) => {
      ethereumProvider.on(event, (params: unknown): void => {
        this.postMessage({ method: event, params: [params] })
      })
    })
  }

  /**
   * Processes a JSON-RPC request and sends appropriate response or error via the content window.
   * @param request - The JSON-RPC request to be processed.
   */
  processRequest(request: JsonRpcRequest) {
    if (!this.ethereumProvider) return

    const request$ =
      request.method === 'enable' //
        ? this.ethereumProvider.enable()
        : this.ethereumProvider.request(request)

    request$
      .then((result) => {
        this.postMessage({ id: request.id, result })
      })
      .catch((error) => {
        this.postMessage({ id: request.id, error })
      })
  }

  private processEvent = (event: MessageEvent) => {
    if (event.data.jsonrpc === '2.0') {
      if (this.ethereumProvider) {
        this.processRequest(event.data)
      } else {
        this.requests[event.data.id] = event.data
      }
    }
  }

  private postMessage(params: { [key: string]: unknown }) {
    this.contentWindow.postMessage(
      {
        jsonrpc: JSON_PRC_V,
        ...params,
      },
      TARGET_ORIGIN
    )
  }
}

import { EthereumProvider, JsonRpcRequest } from './types'

const JSON_PRC_V = '2.0'
const TARGET_ORIGIN = '*'
const EVENTS = ['connect', 'disconnect', 'chainChanged', 'accountsChanged']

export class JsonRpcManager {
  ethereumProvider: EthereumProvider | null = null

  requests: { [key: string]: JsonRpcRequest } = {}

  constructor(private contentWindow: Window) {
    window.addEventListener('message', this.processEvent)
  }

  disconnect() {
    this.ethereumProvider = null
    window.removeEventListener('message', this.processEvent)
  }

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

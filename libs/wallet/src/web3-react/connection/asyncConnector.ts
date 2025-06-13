import { Web3Provider } from '@ethersproject/providers'
import { Actions, Connector } from '@web3-react/types'

import EventEmitter from 'events'

export const ASYNC_CUSTOM_PROVIDER_EVENT = 'customProvider'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function initCustomProvider(self: AsyncConnector, connector: Connector, chainId: number) {
  if (connector.provider && !connector.customProvider) {
    self.customProvider = new Web3Provider(connector.provider, chainId)
  }

  self.events.emit(ASYNC_CUSTOM_PROVIDER_EVENT, self.customProvider)

  // Update provider when network is changed on wallet side
  connector.provider?.on('chainChanged', (chainIdHex: string) => {
    initCustomProvider(self, connector, +chainIdHex)
  })
}

/**
 * To avoid including external libs for wallet connection in the bundle
 * We load them in runtime by demand
 */
export class AsyncConnector extends Connector {
  readonly events = new EventEmitter()

  constructor(private loader: () => Promise<Connector>, actions: Actions, onError?: (error: Error) => void) {
    super(actions, onError)
  }

  activate(chainId: number): Promise<void> | void {
    return this.loader().then((connector) => {
      // There is a magic - we change async-connector prototype to the loaded connector
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(this as any).__proto__ = connector

      return (connector.activate(chainId) || Promise.resolve()).then(() => {
        initCustomProvider(this, connector, chainId)
      })
    })
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async connectEagerly(chainId: number) {
    return this.loader().then((connector) => {
      // There is a magic - we change async-connector prototype to the loaded connector
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(this as any).__proto__ = connector

      const activation = connector.connectEagerly?.(chainId) || Promise.resolve()

      return activation.then(() => {
        initCustomProvider(this, connector, chainId)
      })
    })
  }
}

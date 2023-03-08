import { Actions, Connector } from '@web3-react/types'

/**
 * To avoid including external libs for wallet connection in the bundle
 * We load them in runtime by demand
 */
export class AsyncConnector extends Connector {
  constructor(private loader: () => Promise<Connector>, actions: Actions, onError?: (error: Error) => void) {
    super(actions, onError)
  }

  activate(...args: unknown[]): Promise<void> | void {
    return this.loader().then((connector) => {
      // There is a magic - we change async-connector prototype to the loaded connector
      ;(this as any).__proto__ = connector
      return connector.activate(...args)
    })
  }
}
